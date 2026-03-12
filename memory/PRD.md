# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida
- **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## Project Overview
A serverless ad selection pipeline (SQS → Lambda → SQS/DynamoDB) with an LLM-augmented Ukraine advocacy engine (Project Bulava). Portfolio site with Ukrainian-themed design.

## Design System
- **Primary Blue**: #005BBB | **Accent Gold**: #FFD500 | **Dark**: #0f0f1a

## Tabs (8)
1. **Home** - Hero, stats, bio strip, Ukraine teaser
2. **Live Testing** - Interactive tests, latency breakdown, detailed bottleneck, history (like-test comparison + annotations)
3. **Architecture** - Pipeline diagram, scoring formula, AWS resources
4. **Optimizations** - Tier 1/2/3 (SnapStart, Provisioned Mode, low-level DDB, etc.)
5. **Terraform** - Complete IaC
6. **Course** - IDC5131 info
7. **About Matt** - West Point narrative, 9 certifications, 5 projects, experience
8. **Bulava** - Three-tier architecture, interactive demo, batch simulation, Diia, partnership vision

## Project Bulava — Three-Tier Architecture
| Tier | Name | Latency | Status |
|---|---|---|---|
| 1 | Speculative Pre-Cache (DynamoDB DAX) | <1ms lookup | Designed |
| 2 | Micro-LLM Sidecar (2B model) | 50-100ms | Designed |
| 3 | Template Fallback (45 messages) | <0.01ms | LIVE |

**CRITICAL**: Zero latency impact on core pipeline. Bulava augmentation runs at portfolio backend level, NOT in Lambda.

## API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/warmup | Warm up Lambda containers |
| POST | /api/test | Run performance test |
| GET | /api/test-history | Past test runs |
| DELETE | /api/test-history/{id} | Delete run |
| DELETE | /api/test-history | Clear all |
| PATCH | /api/test-history/{id}/annotate | Annotate run |
| POST | /api/bulava/augment | Generate Ukraine augmentation |
| GET | /api/bulava/categories | Available categories/types |
| POST | /api/bulava/batch-demo | Batch augmentation simulation |
| POST | /api/heartbeat | PC auto-scaling heartbeat |
| GET | /api/pc-status | Provisioned concurrency status |

## Completed Features
- [x] Core Ad-Bidding Lambda (Python 3.12, SnapStart, Provisioned Mode, low-level DDB)
- [x] Ukrainian-themed portfolio (8 tabs, responsive)
- [x] Latency breakdown + detailed bottleneck analysis
- [x] Test history: like-test comparison + annotations
- [x] About Matt (narrative, 9 certs, projects, experience)
- [x] Project Bulava (3-tier architecture, interactive demo, batch simulation)
- [x] Diia Platform stats, NCF-Ukraine partnership, CTA
- [x] Terraform IaC
- [x] SAM deployed to AWS

## Phase 2 (Future)
- [ ] Tier 1: Speculative Pre-Cache with DynamoDB DAX
- [ ] Tier 2: Micro-LLM sidecar for real-time augmentations
- [ ] Interactive scoring calculator
- [ ] CSV export for test results
- [ ] Framer Motion transitions
