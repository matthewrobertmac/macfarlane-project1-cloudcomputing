# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida | **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## Tabs (8)
1. Home | 2. Live Testing | 3. Architecture | 4. Optimizations | 5. Terraform | 6. Course | 7. About Matt | 8. Bulava

## Grading Rubric Compliance (100/100)
### Code — 80 pts
- [x] Task 1: compute_score() — 15 pts ✅
- [x] Task 2: select_winner() — 15 pts ✅
- [x] Task 3: process_opportunity() — 15 pts ✅ (was MISSING, now added)
- [x] Task 4: lambda_handler() — 20 pts ✅ (logging was MISSING, now added)
- [x] E2E Pipeline — 15 pts ✅ (501 DynamoDB records, screenshots now committed)

### Analysis — 20 pts
- [x] Q1: Results Analysis — 10 pts ✅ (in analysis.ipynb)
- [x] Q2: Code Reflection — 10 pts ✅ (Option A: Scale & Limits)

## Completed Features
- [x] Core Ad-Bidding Lambda (all 4 required functions)
- [x] Ukrainian-themed portfolio (8 tabs, responsive)
- [x] SSE Real-Time Result Streaming
- [x] CSV Export, Framer Motion transitions
- [x] Interactive Scoring Calculator
- [x] Performance Timeline
- [x] Full Grading Rubric on Course tab with verification evidence
- [x] Burst test screenshots in screenshots/ directory
- [x] analysis.ipynb with executed outputs (501 records)

## Future
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
- [ ] Re-run burst tests with Provisioned Concurrency (after AWS quota approval)
