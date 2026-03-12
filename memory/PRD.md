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
A serverless, distributed ad selection pipeline processing live auction streams at scale using AWS Lambda, SQS, and DynamoDB. Portfolio site with Ukrainian-themed design showcasing technical excellence, personal brand, and Ukraine partnership vision.

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## Design System
- **Primary Blue**: #005BBB (Ukrainian flag blue)
- **Accent Gold**: #FFD500 (Ukrainian flag gold)
- **Deep Dark**: #0f0f1a (backgrounds)
- **Theme**: Professional dark with Ukrainian accents

## Tabs (8 total)
1. **Home** - Hero page with stats, bio strip, certification badges, Ukraine teaser
2. **Live Testing** - Interactive test profiles, real-time analytics, latency breakdown, detailed bottleneck analysis, test history with like-test comparison and annotations
3. **Architecture** - Pipeline diagram, scoring formula, AWS resource details
4. **Optimizations** - Tier 1/2/3 structure (SnapStart, Provisioned Mode, low-level DDB, etc.)
5. **Terraform** - Complete IaC with copyable code blocks
6. **Course** - IDC5131 info, requirements coverage matrix
7. **About Matt** - Narrative (West Point → Catholic U → Flatiron → NCF), 9 certifications, 5 projects, experience timeline
8. **Ukraine** - Technological Republic, Diia Platform stats, Palantir/GRIT, distributed systems parallel, NCF-Ukraine partnership 3-lane strategy, candidate projects, CTA

## API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/warmup | Warm up Lambda containers |
| POST | /api/test | Run performance test (auto-saves to history) |
| GET | /api/test-history | Get past test runs (limit 50) |
| DELETE | /api/test-history/{id} | Delete specific run |
| DELETE | /api/test-history | Clear all history |
| PATCH | /api/test-history/{id}/annotate | Add/update annotation on test run |
| POST | /api/heartbeat | Frontend heartbeat for PC auto-scaling |
| GET | /api/pc-status | Get provisioned concurrency status |

## Lambda Optimizations (Ultra Performance Edition)
- Python 3.12 + SnapStart (deployed)
- SQS Provisioned Mode (deployed)
- Low-Level DynamoDB Client (deployed)
- ARM64/Graviton2, 1769MB, orjson
- Parallel I/O, Batch Operations, Connection Pooling

## Completed Features (as of Feb 2026)
- [x] Core Ad-Bidding Lambda Logic
- [x] Ultra Performance Lambda (Py3.12, SnapStart, Provisioned Mode, low-level DDB)
- [x] Portfolio Frontend - Complete redesign with Ukrainian theme, 8 tabs
- [x] Landing/Hero page with stats, CTAs
- [x] About Matt with narrative, 9 certs, projects, experience
- [x] Ukraine tab with Technological Republic, Diia, Palantir, partnership vision
- [x] Latency Breakdown Visualization (stacked bar + service cards)
- [x] Detailed Bottleneck Analysis (actionable recommendations)
- [x] Historical Test Comparison (like-test filtering, annotations, overlay charts)
- [x] Fixed GitHub/LinkedIn/Email links
- [x] Responsive navigation with mobile hamburger menu
- [x] Backend API (FastAPI with all endpoints including annotation)
- [x] Terraform IaC tab
- [x] SAM deployed to AWS (Python 3.12 + SnapStart + Provisioned Mode)

## Phase 2 (Future)
- [ ] Interactive scoring calculator (Architecture tab)
- [ ] Animated SVG pipeline diagrams
- [ ] CSV export for test results
- [ ] Framer Motion page transitions
- [ ] D3.js dependency graph for Terraform
