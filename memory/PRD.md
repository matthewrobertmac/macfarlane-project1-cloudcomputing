# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida | **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## Submission Status — READY
All submission files are in `project1/student-starter/`:
- [x] `iam-policy.json` — account ID `815251012162` populated
- [x] `template.yaml` — SAM template for full pipeline
- [x] `worker/lambda_handler.py` — all 4 tasks, 23 tests passing
- [x] `worker/tests/test_handler.py` — 3 test suites
- [x] `analysis/analysis.ipynb` — executed with 22,470 real DynamoDB records
- [x] `screenshots/burst_run.png` — 731ms avg, 500/500 messages, Personal Best
- [x] `cleanup.py`, `README.md`

## AWS Configuration
- Account concurrent execution limit: 1000
- Reserved concurrent executions: 500
- Provisioned Concurrency: 50 (10 allocated)
- SQS Provisioned Mode pollers: 20 min → 200 max
- Connection pool: 100 (TCP keepalive enabled)

## Performance Optimizations (5 Phases)

### Phase 1: High Concurrency
- Provisioned Concurrency: 50, Reserved: 500
- SQS Provisioned Mode pollers: 20 min → 200 max

### Phase 2: Throughput Optimizations
- Concurrent SQS polling, batch deletion, parallel sending
- Non-blocking async I/O (asyncio.to_thread)

### Phase 3: P0 Latency Optimizations
- Global SQS client singleton with TCP keepalive + 100-connection pool
- Per-batch send timestamps, overlapped send/receive, 10 concurrent polls
- Adaptive WaitTimeSeconds, aggressive botocore config

### Phase 4: Deep Optimizations
- orjson for all JSON serialization/deserialization
- Startup connection pre-warming, ThreadPoolExecutor(30)
- Performance Regression Alert

### Phase 5: Systematic Stack Optimization
- Queue drain, pre-serialized bodies, adaptive poll count
- Early exit on completion, Lambda client singleton
- Frontend throttled metrics + useMemo

## Burst Performance (500 msgs) — Evolution
| Metric | Original | +Concurrency | +Throughput | +All Opts |
|--------|----------|--------------|-------------|-----------|
| AVG    | 11,026ms | 2,896ms      | 987ms       | **731ms** |
| P95    | 19,540ms | 5,051ms      | 1,347ms     | **950ms** |
| THR    | 0.1/s    | 0.1/s        | 207.2/s     | **336.8/s** |

## Completed Features
- [x] All submission files prepared and notebook executed
- [x] Core Ad-Bidding Lambda (all 4 required functions + logging)
- [x] Ukrainian-themed portfolio (8 tabs, responsive, Framer Motion)
- [x] SSE Real-Time Result Streaming
- [x] CSV Export, Interactive Scoring Calculator
- [x] Full Grading Rubric mapping
- [x] All 5 phases of performance optimization
- [x] Performance Regression Alert
- [x] Latency Breakdown + Bottleneck Analysis
- [x] Optimization Journey comparison card

## Backlog
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
