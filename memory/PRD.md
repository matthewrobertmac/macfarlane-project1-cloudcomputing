# AdFlow Ad Selection Pipeline + Project Bulava

## Student Information
- **Name**: Matthew R. MacFarlane
- **Email**: matthew.macfarlane27@ncf.edu
- **Student ID**: macfarlane
- **Course**: IDC5131 - Distributed Systems for Data Science
- **Institution**: New College of Florida | **Semester**: Spring 2026

## Live URL
https://adflow-pipeline.preview.emergentagent.com

## Design System
Primary Blue: #005BBB | Accent Gold: #FFD500 | Dark: #0f0f1a

## Tabs (8)
1. Home | 2. Live Testing | 3. Architecture | 4. Optimizations | 5. Terraform | 6. Course | 7. About Matt | 8. Bulava

## Project Bulava — Three-Tier Architecture
| Tier | Name | Latency | Status |
|---|---|---|---|
| 1 | Speculative Pre-Cache | <1ms | Designed |
| 2 | Micro-LLM Sidecar | 50-100ms | Designed |
| 3 | Template Fallback (45 msgs) | <0.01ms | LIVE |

## API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/warmup | Warm up Lambda |
| POST | /api/test | Run performance test (legacy) |
| GET | /api/test/stream?profile=X | SSE streaming — real-time results |
| GET | /api/test-history | Past runs |
| DELETE | /api/test-history/{id} | Delete run |
| DELETE | /api/test-history | Clear all |
| PATCH | /api/test-history/{id}/annotate | Annotate run |
| POST | /api/bulava/augment | Generate augmentation |
| GET | /api/bulava/categories | Available categories/types |
| POST | /api/bulava/batch-demo | Batch simulation |
| GET | /api/bulava/analytics | Aggregated analytics |
| POST | /api/heartbeat | PC heartbeat |
| GET | /api/pc-status | PC status |

## Completed Features
- [x] Core Ad-Bidding Lambda (Py3.12, SnapStart, Provisioned Mode, low-level DDB)
- [x] Ukrainian-themed portfolio (8 tabs, responsive)
- [x] Latency breakdown + detailed bottleneck analysis
- [x] Test history: like-test comparison + annotations
- [x] About Matt (narrative, 9 certs, projects, experience)
- [x] Project Bulava (3-tier arch, interactive demo, batch sim)
- [x] Bulava Analytics Dashboard (category/type charts, totals)
- [x] Diia stats, NCF-Ukraine partnership, CTA
- [x] Terraform IaC + SAM deployed to AWS
- [x] SSE Real-Time Result Streaming (Feb 2026)
- [x] CSV Export for test results and history (Feb 2026)
- [x] Framer Motion page transitions on all 8 tabs (Feb 2026)
- [x] Interactive Scoring Formula Calculator (Feb 2026)
- [x] Performance Timeline — historical avg/p95/min latency chart (Feb 2026)

## Future
- [ ] Tier 1: DynamoDB DAX speculative cache (Bulava)
- [ ] Tier 2: Micro-LLM sidecar (Bulava)
- [ ] Re-run burst tests with Provisioned Concurrency (after AWS quota approval)
