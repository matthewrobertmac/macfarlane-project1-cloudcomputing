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
- Connection pool: 50

## Throughput Optimizations Applied
1. Concurrent SQS polling (5 parallel polls via asyncio.gather)
2. Batch message deletion (delete_message_batch, fire-and-forget)
3. Parallel SQS sending (asyncio.gather for all batches)
4. Non-blocking async I/O (asyncio.to_thread for all AWS calls)
5. Correct throughput formula (wall-clock time, not sum of latencies)
6. Connection pool scaled to 50

## Burst Performance (500 msgs)
| Metric | Original | High Concurrency | + Throughput Opts | Total Change |
|--------|----------|------------------|-------------------|-------------|
| AVG    | 11,026ms | 2,896ms          | 987ms             | **-91%**    |
| P95    | 19,540ms | 5,051ms          | 1,347ms           | **-93%**    |
| MAX    | 20,368ms | 5,263ms          | 1,423ms           | **-93%**    |
| THR    | 0.1/s    | 0.1/s (wrong)    | **207.2/s**       | **2072x**   |
| Wall   | ~25s     | ~7s              | **2.6s**          | **-90%**    |

## Completed Features
- [x] Core Ad-Bidding Lambda (all 4 required functions + logging)
- [x] Ukrainian-themed portfolio (8 tabs, responsive, Framer Motion)
- [x] SSE Real-Time Result Streaming
- [x] CSV Export, Framer Motion transitions
- [x] Interactive Scoring Calculator, Performance Timeline
- [x] Full Grading Rubric on Course tab
- [x] High Concurrency (PC=50, Reserved=500, Pollers=20-200)
- [x] Comprehensive Throughput Optimizations

## Future
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
