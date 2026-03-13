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

**Bulava Analytics Dashboard**: Tracks augmentation usage by category (horizontal bar chart) and message type (donut chart). Shows total augmentations, categories reached, top category, top type. Updates in real-time after each augmentation.

## API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/warmup | Warm up Lambda |
| POST | /api/test | Run performance test (legacy, blocking) |
| GET | /api/test/stream?profile=X | **SSE streaming endpoint** — real-time results |
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
- [x] **SSE Real-Time Result Streaming** (Feb 2026) — Results stream to frontend as they arrive from SQS, with live progress bar and incremental chart updates

## Phase 2 (Future)
- [ ] Tier 1: DynamoDB DAX speculative cache
- [ ] Tier 2: Micro-LLM sidecar
- [ ] Interactive scoring calculator
- [ ] CSV export, Framer Motion transitions
