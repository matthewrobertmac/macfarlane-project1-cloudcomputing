# AdFlow Ad Selection Pipeline - Project Documentation

## Original Problem Statement
Build a Lambda-based bid engine that processes a live stream of ad auctions, persists results to DynamoDB, and produces an analytical report for a Distributed Systems course at New College of Florida.

## Student Information
- **Name**: Matthew R. MacFarlane
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Instructor**: Prof. Gil Salu
- **Institution**: New College of Florida
- **Semester**: Spring 2026

## Architecture
- **Input Queue**: SQS queue (`adflow-macfarlane-input`) receives ad opportunities
- **Lambda Worker**: `adflow-macfarlane-worker` processes batches of opportunities
- **Results Queue**: SQS queue (`adflow-macfarlane-results`) for processed results
- **DynamoDB Table**: `adflow-macfarlane-results` for persistent storage
- **Portfolio Frontend**: React app showcasing project (completely independent from AWS)

## Tasks Completed

### Task 1: compute_score() ✅
Implemented scoring formula: `score = bid_amount × relevance_multiplier × time_bonus × device_bonus`
- Handles edge cases: zero/missing bid amounts, unknown categories, unparseable timestamps
- OPTIMIZED: Pre-computed TIME_BONUS_BY_HOUR array for O(1) lookup

### Task 2: select_winner() ✅
Evaluates all bids for an opportunity and returns winner with:
- winning_advertiser_id, winning_bid_amount, winning_score, score_margin

### Task 3: process_opportunity() ✅
End-to-end processing:
1. Selects winner
2. Posts result to SQS (latency-measured path)
3. Writes to DynamoDB with Decimal conversion
- OPTIMIZED: Module-level Table reference, batch I/O

### Task 4: lambda_handler() ✅
Batch processing with:
- Exception isolation (one bad message doesn't crash batch)
- batchItemFailures return format for SQS retry
- Timing logging for performance monitoring
- OPTIMIZED: Parallel I/O, batch DynamoDB writes

### Analysis Notebook ✅
- 501 records loaded from DynamoDB
- Q1: Results analysis with overall vs sports-specific winner comparison
- Q2: Scale & limits analysis for 10K messages/second scenario

### Portfolio Frontend ✅
- Professional React portfolio showcasing project
- Tabs: Project Details, Course Info, Skills & Tech
- Information about New College of Florida and the course
- Does NOT interfere with AWS backend (completely decoupled)

## Performance Optimizations Applied

| Optimization | Impact |
|-------------|--------|
| Module-level DynamoDB Table | Reduced cold start overhead |
| Pre-computed TIME_BONUS_BY_HOUR | O(1) vs O(n) lookup |
| Parallel I/O (ThreadPoolExecutor) | SQS + DynamoDB concurrent |
| Batch DynamoDB writes | 90% fewer API calls |
| Lambda Memory 512MB | 2x CPU, cost-neutral |

## Performance Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lambda Batch Time | 400-600ms | 10-40ms | 93% faster |
| Cold Start | ~500ms | ~200ms | 60% faster |
| Warmup <500ms | 0% | 60% | +60% |

## Test Results
All 8 pytest tests passing:
- TestComputeScore: 4/4 passed
- TestSelectWinner: 3/3 passed
- TestLambdaHandler: 1/1 passed

## AWS Resources
- Stack: `adflow-macfarlane`
- Region: `us-east-1`
- Account: `815251012162`

## Files Structure
```
/app/DistributedForDataScienceF26/project1/student-starter/
├── worker/
│   ├── lambda_handler.py    # Optimized Lambda code
│   └── tests/               # pytest tests
├── analysis/
│   └── analysis.ipynb       # Analyst report
├── template.yaml            # SAM template
├── performance_test.py      # CLI performance testing
└── screenshots/             # Test apparatus screenshots

/app/frontend/               # Portfolio frontend (independent)
└── src/App.js              # React portfolio
```

## What's Implemented
- [x] Complete lambda_handler.py implementation
- [x] Performance optimizations (parallel I/O, batch writes)
- [x] All tests passing locally
- [x] SAM deployment successful
- [x] 500+ messages processed end-to-end
- [x] Analysis notebook with answers
- [x] IAM policy updated with student ID
- [x] Portfolio frontend with project/course info

## Next Steps / Backlog
- [ ] Push to GitHub on `macfarlane` branch
- [ ] Add test apparatus screenshot to screenshots/ directory
- [ ] Run `sam delete` when project is graded (to avoid AWS charges)

## Portfolio Frontend URL
https://score-and-select.preview.emergentagent.com
