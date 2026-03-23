# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida | **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## AWS Configuration
- Account concurrent execution limit: 1000
- Reserved concurrent executions: 500
- Provisioned Concurrency: 50 (10 allocated)
- SQS Provisioned Mode pollers: 20 min → 200 max
- Connection pool: 100 (TCP keepalive enabled)

## Performance Optimizations Stack (Cumulative)

### Phase 1: High Concurrency (Completed)
- Provisioned Concurrency: 50, Reserved: 500
- SQS Provisioned Mode pollers: 20 min → 200 max

### Phase 2: Throughput Optimizations (Completed)
- Concurrent SQS polling (5 parallel polls via asyncio.gather)
- Batch message deletion (delete_message_batch, fire-and-forget)
- Parallel SQS sending (asyncio.gather for all batches)
- Non-blocking async I/O (asyncio.to_thread for all AWS calls)

### Phase 3: P0 Latency Optimizations (Completed 2026-03-23)
- Global SQS client singleton with TCP keepalive + 100-connection pool
- Per-batch send timestamps (accurate per-message latency measurement)
- Overlapped send/receive for burst mode (pre-polling during sends)
- 10 concurrent SQS polls (up from 5)
- Adaptive WaitTimeSeconds (0 when results flowing, 1 when dry)
- Aggressive botocore config (3s connect, 5s read, 1 retry)

### Phase 4: Deep Optimizations (Completed 2026-03-23)
- orjson for all JSON serialization/deserialization (3-10x faster than stdlib)
- Startup connection pre-warming (dummy SQS call at boot)
- Dedicated ThreadPoolExecutor (30 workers for SQS I/O)
- Performance Regression Alert (auto-compares vs best historical per profile)

## Burst Performance (500 msgs) — Evolution
| Metric | Original | +Concurrency | +Throughput | +P0 Latency |
|--------|----------|--------------|-------------|-------------|
| AVG    | 11,026ms | 2,896ms      | 987ms       | ~100-268ms  |
| P95    | 19,540ms | 5,051ms      | 1,347ms     | ~349ms      |
| MAX    | 20,368ms | 5,263ms      | 1,423ms     | ~349ms      |
| THR    | 0.1/s    | 0.1/s        | 207.2/s     | 55-207/s    |

## Completed Features
- [x] Core Ad-Bidding Lambda (all 4 required functions + logging)
- [x] Ukrainian-themed portfolio (8 tabs, responsive, Framer Motion)
- [x] SSE Real-Time Result Streaming
- [x] CSV Export, Framer Motion transitions
- [x] Interactive Scoring Calculator, Performance Timeline
- [x] Full Grading Rubric on Course tab
- [x] High Concurrency (PC=50, Reserved=500, Pollers=20-200)
- [x] Comprehensive Throughput Optimizations
- [x] P0 Latency Optimizations (global client, overlap, adaptive polling)
- [x] Optimization Journey before/after comparison card
- [x] Latency Breakdown visualization (stacked bar + per-service cards)
- [x] Bottleneck Analysis with recommendations
- [x] orjson fast serialization throughout backend
- [x] Startup connection pre-warming + ThreadPoolExecutor(30)
- [x] Performance Regression Alert (personal best / regression / normal)

## Backlog
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
- [ ] Provisioned Concurrency auto-scaling (blocked by SnapStart conflict)
