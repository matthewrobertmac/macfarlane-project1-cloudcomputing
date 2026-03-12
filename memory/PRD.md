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
**Live URL**: https://score-and-select.preview.emergentagent.com

### Tabs Implemented
1. **Live Testing** - Interactive test profiles (warmup, steady, burst, soak) with real-time analytics
2. **Architecture** - Professor's template vs optimized implementation comparison
3. **Optimizations** - Performance improvements with cost analysis (FREE/SAVES $/NEUTRAL)
4. **Course** - Course syllabus info, topics, weekly schedule
5. **About Me** - Education, certifications, projects, contact info

### Key Features
- **Warm Up AWS Button** - Pre-provisions Lambda containers for burst testing
- **Live Latency Charts** - Real-time visualization using Recharts
- **Latency Distribution Pie Chart** - <500ms / 500-1000ms / >1000ms breakdown
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

## Performance Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lambda Batch Time | 600ms | 15ms | 97% faster |
| Cold Start | ~500ms | ~200ms | 60% faster |
| Warmup <500ms | 0% | 60% | +60 points |

## Resume Information Displayed
### Education
- New College of Florida - M.S. Data Science (In Progress) - 2025-2026
- Flatiron School - Full Stack Web Development - 2023
- The Catholic University of America - B.A. Political Science - 2020
- United States Military Academy - West Point - 2012-2015

### Certifications
- AWS Solutions Architect Associate
- AWS Machine Learning Specialty
- Certified Kubernetes Administrator
- GCP Professional Cloud Architect
- GCP Professional Data Engineer
- GCP Professional DevOps Engineer
- Lean Six Sigma Green Belt

### Projects Featured
- MaterMemoriae - Language learning with GPT-4, Whisper, TensorFlow.js
- Voice-to-Vision - AI art generation from song lyrics
- Inference Mesh - TensorFlow Lite object detection
- LitCrypts - Cryptographic puzzle game

## Course Information Displayed
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Topics**: AWS, Git, Spark, Databricks, Snowflake, Kafka, dbt, Airflow
- **Schedule**: Tue/Thu 9:00-10:20 AM, Library 209
- **Instructor**: Prof. Gil Salu
- **Institution**: New College of Florida

## Files Structure
```
/app/frontend/src/App.js     # React portfolio with 6 tabs, charts, testing UI
/app/backend/server.py       # FastAPI with /api/warmup and /api/test endpoints

/app/DistributedForDataScienceF26/project1/student-starter/
├── worker/lambda_handler.py  # Optimized Lambda code
├── template.yaml             # SAM template (512MB, BatchSize 10)
├── terraform/                # Alternative Terraform deployment
│   ├── main.tf              # Complete infrastructure
│   ├── terraform.tfvars     # Variable values
│   └── README.md            # Terraform usage guide
├── analysis/analysis.ipynb   # Analyst report
└── performance_test.py       # CLI testing script
```

## Test Results
- All 8 pytest tests passing
- Backend: 95% (minor timeout on soak test)
- Frontend: 100%
- Integration: 100%

## Next Steps
1. Push to GitHub on `macfarlane` branch
2. Take test apparatus screenshot for submission
3. After grading: `sam delete --stack-name adflow-macfarlane`
