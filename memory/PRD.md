# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida | **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## AWS Configuration (High Concurrency)
- Account concurrent execution limit: 1000
- Reserved concurrent executions: 500
- Provisioned Concurrency: 50 (version 13, alias: live)
- SQS Provisioned Mode pollers: 20 min → 200 max
- Backend: Parallel send + parallel poll for burst mode

## Completed Features
- [x] Core Ad-Bidding Lambda (all 4 required functions + logging)
- [x] Ukrainian-themed portfolio (8 tabs, responsive)
- [x] SSE Real-Time Result Streaming
- [x] CSV Export, Framer Motion transitions
- [x] Interactive Scoring Calculator, Performance Timeline
- [x] Full Grading Rubric on Course tab
- [x] **High Concurrency Mode** — PC=50, parallel send/poll, 74% latency reduction

## Burst Test Performance (Before → After)
| Metric | Before (10 conc) | After (500 reserved, PC=50) | Change |
|--------|------------------|----------------------------|--------|
| AVG    | 11,026ms         | 2,896ms                    | -74%   |
| P95    | 19,540ms         | 5,051ms                    | -74%   |
| MAX    | 20,368ms         | 5,263ms                    | -74%   |
| MIN    | ~1,700ms         | 849ms                      | -50%   |
| Wall   | ~25s             | 7s                         | -72%   |

## Future
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
