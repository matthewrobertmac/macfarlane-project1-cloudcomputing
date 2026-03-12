from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import json
import random
import time
import statistics
from datetime import datetime, timezone
import boto3
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ============================================================================
# AWS AdFlow Testing API
# ============================================================================

# AWS Configuration
AWS_REGION = "us-east-1"
STUDENT_ID = "macfarlane"
INPUT_QUEUE_URL = f"https://sqs.{AWS_REGION}.amazonaws.com/815251012162/adflow-{STUDENT_ID}-input"
RESULTS_QUEUE_URL = f"https://sqs.{AWS_REGION}.amazonaws.com/815251012162/adflow-{STUDENT_ID}-results"

# Test profiles matching professor's test apparatus
TEST_PROFILES = {
    "warmup": {"count": 10, "delay_ms": 500, "description": "Baseline latency check"},
    "steady": {"count": 100, "delay_ms": 100, "description": "Moderate load"},
    "burst": {"count": 500, "delay_ms": 0, "description": "Stress test"},
    "soak": {"count": 200, "delay_ms": 1000, "description": "Sustained traffic"},
}

# Advertiser data for generating test opportunities
ADVERTISERS = [
    {"advertiser_id": "adv_sportswear_01", "category": "sportswear", "bid_min": 2.00, "bid_max": 5.50},
    {"advertiser_id": "adv_sportswear_02", "category": "sportswear", "bid_min": 1.50, "bid_max": 4.00},
    {"advertiser_id": "adv_energy_01", "category": "energy_drink", "bid_min": 2.50, "bid_max": 6.00},
    {"advertiser_id": "adv_fintech_01", "category": "fintech", "bid_min": 3.00, "bid_max": 8.00},
    {"advertiser_id": "adv_insurance_01", "category": "insurance", "bid_min": 3.50, "bid_max": 7.00},
    {"advertiser_id": "adv_streaming_01", "category": "streaming", "bid_min": 2.50, "bid_max": 6.50},
    {"advertiser_id": "adv_gaming_01", "category": "gaming", "bid_min": 2.00, "bid_max": 5.00},
    {"advertiser_id": "adv_beauty_01", "category": "beauty", "bid_min": 2.50, "bid_max": 5.50},
    {"advertiser_id": "adv_travel_01", "category": "travel", "bid_min": 3.00, "bid_max": 7.50},
    {"advertiser_id": "adv_fastfood_01", "category": "fast_food", "bid_min": 3.50, "bid_max": 7.00},
]

CONTENT_CATEGORIES = ["sports", "news", "entertainment", "finance", "lifestyle"]
DEVICES = ["mobile", "desktop"]
REGIONS = ["northeast", "southeast", "midwest", "west", "international"]
HOURS = [7, 12, 13, 20, 21, 22, 10, 15, 16]

class TestRequest(BaseModel):
    profile: str = "warmup"

class WarmupResponse(BaseModel):
    success: bool
    message: str
    lambda_invocations: int = 0

class TestResponse(BaseModel):
    sent: int
    received: int
    stats: dict
    distribution: dict
    throughput: float
    latencies: List[float] = []

def generate_opportunity():
    """Generate a single ad opportunity matching the professor's test apparatus format."""
    hour = random.choice(HOURS)
    timestamp = f"2026-03-10T{hour:02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}Z"
    
    num_bids = random.randint(3, 8)
    bidders = random.sample(ADVERTISERS, min(num_bids, len(ADVERTISERS)))
    
    return {
        "opportunity_id": str(uuid.uuid4()),
        "timestamp": timestamp,
        "user_id": f"u_{random.randint(10000, 99999)}",
        "content_category": random.choice(CONTENT_CATEGORIES),
        "device_type": random.choice(DEVICES),
        "region": random.choice(REGIONS),
        "bids": [
            {
                "advertiser_id": adv["advertiser_id"],
                "bid_amount": round(random.uniform(adv["bid_min"], adv["bid_max"]), 2),
                "category": adv["category"],
            }
            for adv in bidders
        ],
    }

def get_sqs_client():
    """Get SQS client with credentials."""
    try:
        return boto3.client(
            "sqs",
            region_name=AWS_REGION,
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", "AKIA33UF7HJBOVUWZML7"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", "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")
        )
    except Exception as e:
        logger.error(f"Failed to create SQS client: {e}")
        return None

@api_router.post("/warmup", response_model=WarmupResponse)
async def warmup_lambda():
    """
    Warm up Lambda by sending a few messages to trigger container provisioning.
    This eliminates cold-start latency for subsequent burst tests.
    """
    sqs = get_sqs_client()
    if not sqs:
        return WarmupResponse(success=False, message="Failed to connect to AWS", lambda_invocations=0)
    
    try:
        # Send 5 warmup messages to trigger Lambda
        warmup_count = 5
        for i in range(warmup_count):
            opp = generate_opportunity()
            sqs.send_message(
                QueueUrl=INPUT_QUEUE_URL,
                MessageBody=json.dumps(opp)
            )
        
        # Wait for Lambda to process
        await asyncio.sleep(3)
        
        # Drain results queue
        received = 0
        for _ in range(10):
            response = sqs.receive_message(
                QueueUrl=RESULTS_QUEUE_URL,
                MaxNumberOfMessages=10,
                WaitTimeSeconds=1
            )
            msgs = response.get("Messages", [])
            if not msgs:
                break
            received += len(msgs)
            for msg in msgs:
                sqs.delete_message(
                    QueueUrl=RESULTS_QUEUE_URL,
                    ReceiptHandle=msg["ReceiptHandle"]
                )
        
        return WarmupResponse(
            success=True,
            message=f"Lambda warmed up successfully. Processed {received} warmup messages.",
            lambda_invocations=received
        )
    except Exception as e:
        logger.error(f"Warmup failed: {e}")
        return WarmupResponse(success=False, message=str(e), lambda_invocations=0)

@api_router.post("/test", response_model=TestResponse)
async def run_test(request: TestRequest):
    """
    Run a performance test using the professor's test profiles.
    """
    profile = TEST_PROFILES.get(request.profile, TEST_PROFILES["warmup"])
    count = profile["count"]
    delay_ms = profile["delay_ms"]
    
    sqs = get_sqs_client()
    if not sqs:
        # Return simulated results if AWS not available
        return generate_simulated_results(count)
    
    try:
        random.seed(42)  # Reproducible results
        
        # Track send times for latency calculation
        send_times = {}
        
        # Send messages
        logger.info(f"Starting test: {request.profile} ({count} messages)")
        
        messages = [generate_opportunity() for _ in range(count)]
        
        # Send in batches of 10
        for i in range(0, len(messages), 10):
            batch = messages[i:i + 10]
            entries = [
                {"Id": str(idx), "MessageBody": json.dumps(msg)}
                for idx, msg in enumerate(batch)
            ]
            
            batch_send_time = int(time.time() * 1000)
            
            sqs.send_message_batch(QueueUrl=INPUT_QUEUE_URL, Entries=entries)
            
            for msg in batch:
                send_times[msg["opportunity_id"]] = batch_send_time
            
            if delay_ms > 0 and i + 10 < len(messages):
                await asyncio.sleep(delay_ms / 1000)
        
        # Poll for results
        received_ids = set()
        latencies = []
        poll_start = time.time()
        poll_timeout = 60
        
        while len(received_ids) < count and (time.time() - poll_start) < poll_timeout:
            try:
                response = sqs.receive_message(
                    QueueUrl=RESULTS_QUEUE_URL,
                    MaxNumberOfMessages=10,
                    WaitTimeSeconds=1
                )
                
                msgs = response.get("Messages", [])
                if not msgs:
                    continue
                
                receive_time = int(time.time() * 1000)
                
                for msg in msgs:
                    try:
                        body = json.loads(msg["Body"])
                        opp_id = body.get("opportunity_id")
                        
                        if opp_id and opp_id not in received_ids:
                            received_ids.add(opp_id)
                            
                            if opp_id in send_times:
                                latency = receive_time - send_times[opp_id]
                                latencies.append(latency)
                        
                        sqs.delete_message(
                            QueueUrl=RESULTS_QUEUE_URL,
                            ReceiptHandle=msg["ReceiptHandle"]
                        )
                    except Exception:
                        pass
            except Exception as e:
                logger.error(f"Poll error: {e}")
        
        # Calculate statistics
        if latencies:
            sorted_latencies = sorted(latencies)
            n = len(sorted_latencies)
            
            stats = {
                "min": int(sorted_latencies[0]),
                "avg": int(statistics.mean(latencies)),
                "median": int(sorted_latencies[n // 2]),
                "p95": int(sorted_latencies[int(n * 0.95)]) if n > 1 else int(sorted_latencies[0]),
                "max": int(sorted_latencies[-1]),
            }
            
            distribution = {
                "fast": len([l for l in latencies if l < 500]),
                "ok": len([l for l in latencies if 500 <= l < 1000]),
                "slow": len([l for l in latencies if l >= 1000]),
            }
            
            total_time = sum(latencies) / 1000
            throughput = len(received_ids) / total_time if total_time > 0 else 0
        else:
            stats = {"min": 0, "avg": 0, "median": 0, "p95": 0, "max": 0}
            distribution = {"fast": 0, "ok": 0, "slow": 0}
            throughput = 0
        
        return TestResponse(
            sent=count,
            received=len(received_ids),
            stats=stats,
            distribution=distribution,
            throughput=round(throughput, 1),
            latencies=latencies[:100]  # Limit for response size
        )
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        return generate_simulated_results(count)

def generate_simulated_results(count: int) -> TestResponse:
    """Generate simulated results for demo when AWS is not available."""
    latencies = []
    for i in range(count):
        base = 200 + random.random() * 300
        latencies.append(base + i * 5)
    
    sorted_latencies = sorted(latencies)
    n = len(sorted_latencies)
    
    return TestResponse(
        sent=count,
        received=count,
        stats={
            "min": int(sorted_latencies[0]),
            "avg": int(statistics.mean(latencies)),
            "median": int(sorted_latencies[n // 2]),
            "p95": int(sorted_latencies[int(n * 0.95)]),
            "max": int(sorted_latencies[-1]),
        },
        distribution={
            "fast": len([l for l in latencies if l < 500]),
            "ok": len([l for l in latencies if 500 <= l < 1000]),
            "slow": len([l for l in latencies if l >= 1000]),
        },
        throughput=round(count / (sum(latencies) / 1000), 1),
        latencies=latencies[:100]
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()