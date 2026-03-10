# AdFlow Ad Selection Pipeline - Project Documentation

## Original Problem Statement
Build a Lambda-based bid engine that processes a live stream of ad auctions, persists results to DynamoDB, and produces an analytical report for a Distributed Systems course at New College of Florida.

## Student ID
macfarlane

## Architecture
- **Input Queue**: SQS queue (`adflow-macfarlane-input`) receives ad opportunities
- **Lambda Worker**: `adflow-macfarlane-worker` processes batches of opportunities
- **Results Queue**: SQS queue (`adflow-macfarlane-results`) for processed results
- **DynamoDB Table**: `adflow-macfarlane-results` for persistent storage

## Tasks Completed

### Task 1: compute_score() ✅
Implemented scoring formula: `score = bid_amount × relevance_multiplier × time_bonus × device_bonus`
- Handles edge cases: zero/missing bid amounts, unknown categories, unparseable timestamps

### Task 2: select_winner() ✅
Evaluates all bids for an opportunity and returns winner with:
- winning_advertiser_id, winning_bid_amount, winning_score, score_margin

### Task 3: process_opportunity() ✅
End-to-end processing:
1. Selects winner
2. Posts result to SQS (latency-measured path)
3. Writes to DynamoDB with Decimal conversion

### Task 4: lambda_handler() ✅
Batch processing with:
- Exception isolation (one bad message doesn't crash batch)
- batchItemFailures return format for SQS retry
- Timing logging for performance monitoring

### Analysis Notebook ✅
- 501 records loaded from DynamoDB
- Q1: Results analysis with overall vs sports-specific winner comparison
- Q2: Scale & limits analysis for 10K messages/second scenario

## Test Results
All 8 pytest tests passing:
- TestComputeScore: 4/4 passed
- TestSelectWinner: 3/3 passed
- TestLambdaHandler: 1/1 passed

## AWS Resources
- Stack: `adflow-macfarlane`
- Region: `us-east-1`
- Account: `815251012162`

## What's Implemented
- [x] Complete lambda_handler.py implementation
- [x] All tests passing locally
- [x] SAM deployment successful
- [x] 500+ messages processed end-to-end
- [x] Analysis notebook with answers
- [x] IAM policy updated with student ID

## Next Steps / Backlog
- [ ] Push to GitHub on `macfarlane` branch
- [ ] Add test apparatus screenshot to screenshots/ directory
- [ ] Run `sam delete` when project is graded (to avoid AWS charges)
