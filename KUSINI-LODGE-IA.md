# Kusini Lodge — Pages, Tabs, Tables & Forms (CANONICAL IA)

Provided by Brian 2026-07-05. The build guide for the Lodge app UI. Maps to KUSINI-SCHEMA.md.
Conventions: KPI cards only on operational pages; tabs segment every list page; forms are
modals or side-drawers (Twenty record-panel pattern); row actions per row.

## At a glance
| Page | Group | KPI cards | Tabs | Primary entity |
|---|---|---|---|---|
| Today | Operations | 5 | 5 | arrival_events (via board_projections) |
| Arrivals | Operations | 4 | 4 | arrival_events (arrival) |
| Departures | Operations | 4 | 4 | arrival_events (departure) |
| Bookings | Operations | 4 | 5 | bookings |
| Guest directory | Guests | 4 | 5 | guests |
| Check-in / Front desk | Guests | 4 | 5 | stays |
| Duties | Workforce | 4 | 5 | duty_assignments |
| Leave planner | Workforce | 4 | 4 | leave_plan |
| Staff | Workforce | — | 5 | staff |
| Rooms | Property | 4 | 5 | rooms |
| Reports | Insights | 4 | 4 | read models |
| Notifications | Global | — | 4 | notifications + transfer_events |
| Settings | Global | — | 5 | config + data_subject_requests |
| Print | Global | — | — | print_jobs |

(Sections per page — tabs, table columns, forms, row actions — as specified in the
conversation of record 2026-07-05; expand inline as each page is implemented.)

Cross-cutting: ⌘K palette (pages + actions) · per-table toolbar (search/status filter/columns/
reload) · empty/offline states (PWA queues acks offline) · KPI cards read board_projections /
materialized counters, never live aggregation (schema §22).
