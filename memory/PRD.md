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
1. **Live Testing** - Interactive test profiles with real-time analytics, latency breakdown, bottleneck analysis, and historical test comparison
2. **Architecture** - Professor's template vs optimized implementation comparison
3. **Optimizations** - Performance improvements with cost analysis (FREE/SAVES $/NEUTRAL)
4. **Terraform** - Infrastructure as Code deployment with copyable code blocks
5. **Course** - Course syllabus info, topics, weekly schedule
6. **About Me** - Education, certifications, projects, contact info

### Key Features
- **Warm Up AWS Button** - Pre-provisions Lambda containers for burst testing
- **Live Latency Charts** - Real-time visualization using Recharts
- **Latency Distribution Pie Chart** - <500ms / 500-1000ms / >1000ms breakdown
- **Latency Breakdown by AWS Service** - Stacked bar + individual cards (SQS Accept, Queue Wait, Lambda Trigger, Lambda Compute, Lambda I/O, SQS Delivery)
- **Bottleneck Analysis** - Identifies primary bottleneck, concurrency status, throughput, recommendations
- **Historical Test Comparison** - Saves runs to MongoDB, select up to 4 runs to overlay with side-by-side bar charts and stacked service breakdown comparisons
- **Statistics Dashboard** - Min, Avg, Median, p95, Max, Throughput
- **Provisioned Concurrency Status** - Real-time PC indicator with heartbeat auto-scaling

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/warmup | Warm up Lambda containers |
| POST | /api/test | Run performance test (saves to history) |
| GET | /api/test-history | Get past test runs (newest first, limit 50) |
| DELETE | /api/test-history/{id} | Delete specific run |
| DELETE | /api/test-history | Clear all history |
| POST | /api/heartbeat | Frontend heartbeat for PC auto-scaling |
| GET | /api/pc-status | Get provisioned concurrency status |

## Architecture (AWS Resources)
- **Lambda**: adflow-macfarlane-worker (512MB, Python 3.11)
- **Input Queue**: adflow-macfarlane-input (Standard SQS)
- **Results Queue**: adflow-macfarlane-results (Standard SQS)
- **DynamoDB**: adflow-macfarlane-results (On-demand)
- **Region**: us-east-1

## Files Structure
```
/app/frontend/src/App.js     # React portfolio with 6 tabs, charts, history comparison
/app/backend/server.py       # FastAPI with test, history, warmup, heartbeat, PC endpoints

/app/DistributedForDataScienceF26/project1/student-starter/
├── worker/lambda_handler.py  # Optimized Lambda code
├── template.yaml             # SAM template
└── performance_test.py       # CLI testing script
```

## Completed Features (as of Feb 2026)
- [x] Core Ad-Bidding Lambda Logic
- [x] Performance Optimization (parallel I/O, batch writes, orjson, ARM64)
- [x] Portfolio Frontend (6 tabs, interactive testing, charts)
- [x] Backend API (FastAPI with all endpoints)
- [x] Provisioned Concurrency Auto-Scaling (code-complete, blocked by AWS quota)
- [x] Terraform IaC tab
- [x] Latency Breakdown Visualization (stacked bar + bottleneck analysis)
- [x] Historical Test Comparison (save, select, overlay, compare)

## Blocked / Pending
- **P1**: Provisioned Concurrency deployment - blocked on AWS quota increase (requested 3000)
- **P2**: Re-run burst tests with PC enabled to document improved performance

## Next Steps
1. Await AWS quota approval for Provisioned Concurrency
2. Push to GitHub on `macfarlane` branch (use "Save to GitHub" button)
3. Take test apparatus screenshot for submission
