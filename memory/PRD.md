# AdFlow Ad Selection Pipeline - Complete Portfolio

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Instructor**: Prof. Gil Salu
- **Institution**: New College of Florida
- **Semester**: Spring 2026

## Project Overview
A serverless, distributed ad selection pipeline processing live auction streams at scale using AWS Lambda, SQS, and DynamoDB. This project demonstrates real-world distributed systems principles for processing ad auctions in under 100ms.

## Portfolio Features
**Live URL**: https://adflow-pipeline.preview.emergentagent.com

### Tabs Implemented
1. **Live Testing** - Interactive test profiles (warmup, steady, burst, soak) with real-time analytics + latency breakdown visualization
2. **Architecture** - Professor's template vs optimized implementation comparison
3. **Optimizations** - Performance improvements with cost analysis (FREE/SAVES $/NEUTRAL)
4. **Terraform** - Infrastructure as Code deployment with copyable code blocks
5. **Course** - Course syllabus info, topics, weekly schedule
6. **About Me** - Education, certifications, projects, contact info

### Key Features
- **Warm Up AWS Button** - Pre-provisions Lambda containers for burst testing
- **Live Latency Charts** - Real-time visualization using Recharts
- **Latency Distribution Pie Chart** - <500ms / 500-1000ms / >1000ms breakdown
- **Latency Breakdown by AWS Service** - Stacked bar + individual cards showing SQS Accept, Queue Wait, Lambda Trigger, Lambda Compute, Lambda I/O, SQS Delivery
- **Bottleneck Analysis** - Identifies primary bottleneck, concurrency status, throughput, recommendations
- **Statistics Dashboard** - Min, Avg, Median, p95, Max, Throughput
- **Professor's Test Profiles** - Matches test-apparatus/index.html exactly

## Architecture (AWS Resources)
- **Lambda**: adflow-macfarlane-worker (512MB, Python 3.11)
- **Input Queue**: adflow-macfarlane-input (Standard SQS)
- **Results Queue**: adflow-macfarlane-results (Standard SQS)
- **DynamoDB**: adflow-macfarlane-results (On-demand)
- **Region**: us-east-1
- **Account**: 815251012162

## Performance Optimizations Applied

| Optimization | Before | After | Impact | Cost |
|-------------|--------|-------|--------|------|
| Parallel I/O | Sequential | ThreadPoolExecutor | 50-70% faster | FREE |
| DynamoDB Batch | put_item() | batch_write_item() | 90% fewer API calls | SAVES $ |
| Module-level Table | Per-request init | Lazy singleton | ~15ms saved | FREE |
| Time Bonus Lookup | O(n) iteration | O(1) array index | Microseconds | FREE |
| Lambda Memory | 256MB | 512MB | 2x CPU | NEUTRAL |
| SQS Batch | send_message() | send_message_batch() | 90% fewer calls | SAVES $ |

## Files Structure
```
/app/frontend/src/App.js     # React portfolio with 6 tabs, charts, testing UI, latency breakdown
/app/backend/server.py       # FastAPI with /api/warmup, /api/test (with latency breakdown), /api/heartbeat, /api/pc-status

/app/DistributedForDataScienceF26/project1/student-starter/
├── worker/lambda_handler.py  # Optimized Lambda code
├── template.yaml             # SAM template (512MB, BatchSize 10)
├── terraform/                # Alternative Terraform deployment
└── performance_test.py       # CLI testing script
```

## Completed Features (as of Feb 2026)
- [x] Core Ad-Bidding Lambda Logic
- [x] Performance Optimization (parallel I/O, batch writes, orjson, ARM64)
- [x] Portfolio Frontend (6 tabs, interactive testing, charts)
- [x] Backend API (FastAPI with test/warmup/heartbeat/PC endpoints)
- [x] Provisioned Concurrency Auto-Scaling (code-complete, blocked by AWS quota)
- [x] Terraform IaC tab
- [x] **Latency Breakdown Visualization** (stacked bar + bottleneck analysis)

## Blocked / Pending
- **P1**: Provisioned Concurrency deployment - blocked on AWS quota increase (requested 3000)
  - Once approved: redeploy SAM stack with PC enabled, test auto-scaling
- **P2**: Re-run burst tests with PC enabled to document improved performance

## Next Steps
1. Await AWS quota approval for Provisioned Concurrency
2. Push to GitHub on `macfarlane` branch
3. Take test apparatus screenshot for submission
