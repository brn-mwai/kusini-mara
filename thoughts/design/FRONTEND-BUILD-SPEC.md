---
type: design
status: draft
created: 2026-08-11
task: Cascade Bridge console - complete frontend implementation spec
---

# Cascade Bridge Console - frontend build spec

Build target. Everything a developer needs to write the code without asking a question.

---

## 1. Stack and conventions

```
Next.js 15 App Router, TypeScript strict
Tailwind 4 + shadcn/ui (borrowed from oryn-ai-mashinani)
TanStack Query v5      server state, caching, background refetch
Zustand                ephemeral UI state only (never server data)
MapLibre GL 4.7        vendored locally, never from a CDN
Recharts               all non-map charts
nuqs                   URL query-param state, so every view is shareable
Zod                    runtime validation on every API boundary
```

**Hard rules**

1. Every number rendered comes from an API field. No arithmetic in a component beyond formatting.
2. Numbers use `font-variant-numeric: tabular-nums` and the mono face. Always.
3. No component reads `process.env` directly. Config flows through `lib/config.ts`.
4. Server data lives only in TanStack Query. Zustand holds panel-open, active-tool, drawer-width.
5. Every list has skeleton, empty, error and offline states before it ships.
6. Class breaks and colour ramps are data from `/v1/layers`, never literals in a component.

---

## 2. Route table

Every route, its page id, and what owns it.

| Route | Page id | Data source | Notes |
|---|---|---|---|
| `/` | `home` | redirect | -> `/counties` |
| `/counties` | `counties.map` | `useCounties`, `useIssue(latest)` | tab: Map |
| `/counties?view=table` | `counties.table` | same | tab: Table |
| `/counties/[countyId]` | `county.detail` | `useCounty(id)`, `useCountySeries(id)` | centre panel opens |
| `/stations` | `stations.activity` | `useStations` | tab: Activity |
| `/stations?view=coverage` | `stations.coverage` | `useStationCoverage` | tab: Coverage |
| `/stations/[stationId]` | `station.detail` | `useStation(id)`, `useStationSeries` | |
| `/maps` | `maps.explorer` | `useLayers`, `useIssue` | tab: Layer Explorer |
| `/maps/issues` | `maps.issues` | `useIssues` | tab: Forecast Issues |
| `/maps/issues/[issueId]` | `issue.detail` | `useIssue(id)` | immutable record |
| `/maps/views` | `maps.saved` | `useSavedViews` | tab: Saved Views |
| `/vegetation` | `layer.vegetation` | `useLayerPage('vci3m')` | |
| `/rainfall` | `layer.rainfall` | `useLayerPage('chirps_precip')` | |
| `/soil-moisture` | `layer.soil` | `useLayerPage('soil_moisture')` | |
| `/outlook` | `layer.outlook` | `useOutlook` | adds ENSO/IOD rail |
| `/reports` | `reports.active` | `useReports({status:'active'})` | tab: Active |
| `/reports?status=resolved` | `reports.resolved` | `useReports({status:'resolved'})` | tab: Resolved |
| `/reports/[reportId]` | `report.thread` | `useReport(id)` | |
| `/reports/new` | `report.create` | mutation only | modal on desktop, route on mobile |
| `/triggers` | `triggers.thresholds` | `useTriggers` | tab: Thresholds |
| `/triggers/plans` | `triggers.plans` | `useActionPlans` | tab: Action Plans |
| `/triggers/timeline` | `triggers.timeline` | `useTriggerTimeline` | tab: Timeline |
| `/triggers/recipients` | `triggers.recipients` | `useRecipients` | tab: Recipients |
| `/scorecard` | `scorecard.skill` | `useSkill` | tab: Skill |
| `/scorecard/issues` | `scorecard.review` | `useIssueReview` | tab: Issue Review |
| `/scorecard/health` | `scorecard.health` | `useDataHealth` | tab: Data Health |
| `/alerts` | `alerts.inbox` | `useAlerts` | |
| `/alerts/[alertId]` | `alert.detail` | `useAlert(id)` | shows CAP XML |
| `/settings/organisation` | `settings.org` | `useOrg` | |
| `/settings/members` | `settings.members` | `useMembers` | |
| `/settings/api-keys` | `settings.keys` | `useApiKeys` | |
| `/settings/sources` | `settings.sources` | `useSources` | |
| `/settings/export` | `settings.export` | `useExportConfig` | |

**Shared URL params**, all through `nuqs`, all shareable:

```
?issue=2026-08          which issue is displayed
?month=2026-10          selected valid month
?layers=prob,vci3m      active layer chips, ordered
?mode=slider            single | multi | slider | overlay
?scope=turkana          county filter, or 'all'
?threshold=0.25         display threshold override
?period=3M              1M | 3M | 1Y | 5Y
```

---

## 3. Data contracts

```ts
// lib/types.ts  — every one has a matching Zod schema in lib/schemas.ts

export type Signal = 'drought' | 'watch' | 'normal' | 'no_coverage'
export type IssueStatus = 'draft' | 'published' | 'verified' | 'superseded'

export interface County {
  id: string                    // 'turkana'
  name: string                  // 'Turkana'
  regionId: string              // 'asal_north'
  regionName: string
  areaKm2: number
  population: number | null
  centroid: [number, number]    // lon, lat
  bbox: [number, number, number, number]
  hasModelCoverage: boolean
}

export interface Forecast {
  countyId: string
  validYear: number
  validMonth: number            // 1-12
  leadMonths: number
  droughtProb: number           // 0-1
  probP10: number | null
  probP90: number | null
  ensembleAgreement: number | null   // 0-1
  membersAboveThreshold: number | null
  membersTotal: number | null
  terciles: { below: number; near: number; above: number } | null
  signal: Signal
  margin: number
  drivers: Driver[] | null
}

export interface Driver {
  feature: string               // 'era5_spi3'
  label: string                 // 'Rainfall deficit, 3 month'
  contribution: number          // SHAP value, signed
  value: number
  unit: string
}

export interface Issue {
  id: string                    // '2026-08'
  status: IssueStatus
  initDate: string              // ISO date, from the GRIB, never the clock
  generatedAt: string
  contentHash: string           // sha256 of the payload
  run: {
    source: string
    ensembleMembers: number
    ensembleReduction: 'mean' | 'member_wise'
    forecastGrib: string
    climatologyGrib: string
    codeCommit: string
    droughtModel: string
    bridgeModel: string
    labelVersion: string        // 'vci3m_v1'
    featureCoverage: number     // 0-1, share of inputs that were real
  }
  config: { threshold: number; thresholdRationale: string }
  forecasts: Forecast[]
  verification: IssueVerification | null
}

export interface IssueVerification {
  verifiedAt: string
  truthSource: string           // 'vci3m_v1'
  brier: number
  brierSkillScore: number
  rocAuc: number
  hits: number
  misses: number
  falseAlarms: number
  correctNegatives: number
  perCounty: Array<{ countyId: string; predicted: number; observed: 0 | 1; brier: number }>
}

export interface LayerDef {
  id: string                    // 'vci3m'
  group: 'forecast' | 'observed' | 'bridge' | 'error' | 'context'
  label: string
  unit: string
  domain: [number, number]
  classBreaks: number[]         // NDMA breaks live here, not in code
  colourRamp: string[]          // hex, low to high
  reversed: boolean
  tileUrl: string               // '/v1/tiles/vci3m/{issue}/{z}/{x}/{y}.png'
  legendKind: 'continuous' | 'classed'
  sourceIssueRequired: boolean
}

export interface Station {
  id: string
  name: string
  kind: 'rain_gauge' | 'weather' | 'water_point' | 'market' | 'observer'
  countyId: string
  coords: [number, number]
  installedAt: string
  lastReadingAt: string | null
  active: boolean
  signalPct: number | null
  batteryPct: number | null
  freshnessPct: number
  status: 'reporting' | 'stale' | 'offline'
}

export interface FieldReport {
  id: string
  topic: 'pasture' | 'water_point' | 'livestock' | 'migration' | 'market' | 'crop' | string
  countyId: string
  ward: string | null
  coords: [number, number]
  observedAt: string
  status: 'active' | 'resolved'
  verified: boolean
  severity: 1 | 2 | 3 | 4 | 5
  photos: Array<{ id: string; url: string; thumbUrl: string; width: number; height: number }>
  messages: Array<{ id: string; authorId: string; authorName: string; avatarUrl: string | null;
                    body: string; createdAt: string }>
  labelContribution: { vci3mEstimate: number | null; usedInLabelVersion: string | null }
}

export interface Trigger {
  id: string
  tenantId: string
  tenantName: string
  levels: { advisory: number; watch: number; warning: number; emergency: number }
  channels: Array<'sms' | 'email' | 'cap' | 'webhook'>
  updatedAt: string
  updatedBy: string
}

export interface Alert {
  id: string
  issueId: string
  countyId: string
  level: 'advisory' | 'watch' | 'warning' | 'emergency'
  firedAt: string
  probability: number
  deliveries: Array<{ channel: string; state: 'queued' | 'sent' | 'failed' | 'acked';
                      at: string; error: string | null }>
  capXml: string
}
```

---

## 4. API surface

Read paths are CDN-cached immutable JSON. Write paths hit the app server.

```
GET  /v1/counties                          County[]
GET  /v1/counties/:id                      County
GET  /v1/counties/:id/series?from&to&vars  { t: string[]; series: Record<string, number[]> }

GET  /v1/issues?status&limit&cursor        { items: IssueSummary[]; nextCursor }
GET  /v1/issues/latest                     Issue
GET  /v1/issues/:issueId                   Issue          immutable, Cache-Control immutable
GET  /v1/issues/:issueId/verification      IssueVerification
GET  /v1/issues/:issueId/export/:fmt       netcdf | geotiff | cap | csv

GET  /v1/layers                            LayerDef[]
GET  /v1/tiles/:layerId/:issueId/:z/:x/:y.png     COG through TiTiler
GET  /v1/layers/:layerId/histogram?issue&county   { bins: number[]; counts: number[] }

GET  /v1/stations                          Station[]
GET  /v1/stations/:id/series?var&from&to

GET  /v1/reports?status&county&topic&cursor
POST /v1/reports                           multipart, photos + json
POST /v1/reports/:id/messages
POST /v1/reports/:id/verify

GET  /v1/triggers
PUT  /v1/triggers/:id                      optimistic, rolls back on 409
POST /v1/triggers/preview                  { levels } -> firing counts, no write

GET  /v1/skill?labelVersion&from&to        SkillReport
GET  /v1/skill/reliability?bins=10
GET  /v1/skill/lead-time
GET  /v1/skill/baselines
GET  /v1/health/data                       DataHealth

GET  /v1/alerts?state&cursor
POST /v1/alerts/:id/ack

POST /v1/chat                              grounded Q&A, numeric verifier server-side
POST /v1/bulletin                          county bulletin, model writes prose only
```

**Every response carries** `X-Issue-Id`, `X-Label-Version`, `X-Content-Hash`. The client displays them in the footer. A mismatch between what the header says and what the page shows is a hard error, not a warning.

---

## 5. State and caching

```ts
// lib/query-keys.ts
export const qk = {
  counties:      ()                 => ['counties'] as const,
  county:        (id: string)       => ['county', id] as const,
  countySeries:  (id: string, p: SeriesParams) => ['county', id, 'series', p] as const,
  issues:        (f: IssueFilter)   => ['issues', f] as const,
  issue:         (id: string)       => ['issue', id] as const,
  layers:        ()                 => ['layers'] as const,
  histogram:     (l: string, i: string, c?: string) => ['hist', l, i, c ?? 'all'] as const,
  stations:      ()                 => ['stations'] as const,
  reports:       (f: ReportFilter)  => ['reports', f] as const,
  triggers:      ()                 => ['triggers'] as const,
  skill:         (p: SkillParams)   => ['skill', p] as const,
  alerts:        (f: AlertFilter)   => ['alerts', f] as const,
}
```

**Cache policy by kind**

| Data | staleTime | gcTime | Why |
|---|---|---|---|
| `issue/:id` (not latest) | `Infinity` | 24h | immutable by contract |
| `issues/latest` | 15 min | 1h | changes monthly, poll cheaply |
| `layers` | 1h | 24h | registry, rarely changes |
| `counties` | 1h | 24h | static |
| `histogram` | `Infinity` per (layer, issue) | 1h | derived from an immutable issue |
| `stations` | 60s | 5min | live-ish |
| `reports` | 30s | 5min | user generated |
| `triggers` | 0 | 5min | always fresh, optimistic writes |
| `skill` | 5 min | 1h | recomputed nightly |

**Offline.** A service worker precaches the shell, `layers`, `counties` and the latest issue payload plus its county-level tiles at z5-z7. Field Reports queue in IndexedDB (`idb-keyval`, store `report-queue`) and flush on `online`. A persistent banner shows queued count. This is the only write path that works offline, by design.

**Persistence.** `persistQueryClient` into IndexedDB, `maxAge` 24h, `buster` set to the app build id so a deploy clears it.

---

## 6. Map layer registry

The registry is fetched, never hardcoded. A component asks for a layer by id and gets everything it needs to render and to draw its own legend.

```ts
// Rendering a raster layer
const { data: layers } = useLayers()
const layer = layers.find(l => l.id === layerId)!

map.addSource(`src-${layer.id}`, {
  type: 'raster',
  tiles: [layer.tileUrl.replace('{issue}', issueId)],
  tileSize: 256,
  bounds: KENYA_BBOX,
  maxzoom: 9,
})
map.addLayer({
  id: `lyr-${layer.id}`,
  type: 'raster',
  source: `src-${layer.id}`,
  paint: { 'raster-opacity': opacity, 'raster-fade-duration': 0 },
}, FIRST_SYMBOL_LAYER_ID)
```

**Vector county layer**, always on top of rasters, below labels:

```ts
map.addLayer({
  id: 'county-fill',
  type: 'fill',
  source: 'counties',
  paint: {
    'fill-color': ['case',
      ['==', ['feature-state', 'coverage'], false], NO_COVERAGE,
      ['interpolate', ['linear'], ['feature-state', 'prob'],
        ...breaksToStops(layer.classBreaks, layer.colourRamp)],
    ],
    'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0.7],
  },
})
```

County probabilities are pushed with `setFeatureState`, never by rebuilding the source. Hover and selection are feature-state too.

**Slider mode** mounts two `Map` instances in a `MapSplitSlider`. Instance B mirrors A through `move` events with a re-entrancy guard:

```ts
const syncing = useRef(false)
a.on('move', () => { if (syncing.current) return
  syncing.current = true; b.jumpTo({ center: a.getCenter(), zoom: a.getZoom(),
  bearing: a.getBearing(), pitch: a.getPitch() }); syncing.current = false })
```

**Layer groups** exactly as in `DASHBOARD-SPEC.md` section 3a: forecast, observed, bridge, error, context.

---

## 7. Component contracts

```ts
// components/console/layer-panel.tsx
interface LayerPanelProps {
  layer: LayerDef
  issueId: string
  countyId?: string
  range: [number, number]                  // display min/max
  onRangeChange: (r: [number, number]) => void
  onSwapLayer: (layerId: string) => void
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
  stats: { primary: { value: number; label: string }
           secondary: { value: number; label: string } }
  align: 'left' | 'right'
}
// Renders: collapse chevrons, open-in-new, calendar, layer name + dropdown,
// vertical histogram (from useHistogram), two draggable handles, axis ticks at
// layer.classBreaks, footer with the two stats.

interface ViewModeToggleProps {
  value: 'single' | 'multi' | 'slider' | 'overlay'
  onChange: (v: ViewMode) => void
  disabled?: ViewMode[]                    // slider needs exactly 2 layers
}

interface MapSplitSliderProps {
  left: { layer: LayerDef; issueId: string }
  right: { layer: LayerDef; issueId: string }
  initialPosition?: number                 // 0-1, default 0.5
  onPositionChange?: (p: number) => void
}

interface TimeScrubberProps {
  periods: Array<'1M' | '3M' | '1Y' | '5Y'>
  period: string
  onPeriodChange: (p: string) => void
  months: Array<{ value: string; label: string; hasData: boolean }>
  selected: string
  onSelect: (m: string) => void
}

interface MetricRowProps {
  thumbnail?: string
  label: string
  value: number
  unit: string
  delta?: number
  risk?: Signal
  sparkline?: number[]
  onClick?: () => void
}

interface EnsembleFanProps {
  members: number[][]                      // 51 x nMonths
  mean: number[]
  p10: number[]
  p90: number[]
  months: string[]
  threshold: number
}

interface ReliabilityDiagramProps {
  bins: Array<{ predicted: number; observed: number; count: number }>
  showDiagonal?: boolean
}

interface TriggerMatrixProps {
  triggers: Trigger[]
  onChange: (id: string, level: keyof Trigger['levels'], value: number) => void
  firingCounts: Record<string, number>     // live from /v1/triggers/preview
  dirty: boolean
  onSave: () => void
  onReset: () => void
}
```

---

## 8. Per-page component trees

### `/counties` — page id `counties.map`

```
<ConsoleShell rail="counties">
  <BandOne title="Counties"
           tabs={[{id:'map',href:'/counties'},{id:'table',href:'/counties?view=table'}]}
           primary={<Button variant="teal" icon="plus">Add county</Button>} />
  <BandTwo search={<SearchInput placeholder="Search county, region, forecast" />}
           filter={<FilterButton />} scope={<ScopeSelect />} overflow={<MoreMenu />} />
  <BandFour layout="three-column">
    <CountyList>                       // left, 320px, scroll
      <CountyRow />                    // thumbnail, name, region, prob, delta, pill
      <Footer><Button variant="teal" full>+ Add county</Button></Footer>
    </CountyList>
    <CountyDetail>                     // centre, flex
      <PanelHeader onClose onCollapse onOverflow />
      <CountyTitle name area population coords />
      <StatusPill signal /> <IssueRef issueId />
      <MetricRow label="Drought probability" .../>
      <MetricRow label="Ensemble agreement" .../>
      <MetricRow label="VCI3M" .../>
      <MetricRow label="Rainfall anomaly" .../>
      <MetricRow label="Land temp anomaly" .../>
      <PeriodTabs values={['1M','3M','6M','1Y','2Y','5Y']} />
      <ProbabilitySeries />            // line + p10/p90 band + threshold rule
    </CountyDetail>
    <CountyMap />                      // right, 40%
  </BandFour>
</ConsoleShell>
```

**Buttons and handlers**

| Element | id | Action |
|---|---|---|
| Add county | `btn.county.add` | opens `DialogAddCounty`, POST `/v1/counties` |
| County row | `row.county.{id}` | `router.push('/counties/'+id)`, sets `?scope=` |
| Close panel | `btn.county.close` | back to `/counties` |
| Period tab | `tab.period.{v}` | sets `?period=`, refetches series |
| Export row | `btn.county.export` | CSV of the visible series |

### `/maps` — page id `maps.explorer`

```
<ConsoleShell rail="maps">
  <BandOne title="Maps" tabs={['Layer Explorer','Forecast Issues','Saved Views']}
           primary={<Button variant="teal" icon="plus">New view</Button>} />
  <BandTwo search scope={<IssueSelect />} overflow />
  <BandThree>
    <LayerChips layers={active} onClose onAdd={openLayerPicker} />
    <ViewModeToggle value={mode} onChange />
  </BandThree>
  <BandFour>
    {mode === 'single'  && <MapCanvas layer={active[0]} />}
    {mode === 'multi'   && <MapGrid layers={active.slice(0,4)} />}
    {mode === 'slider'  && <MapSplitSlider left={active[0]} right={active[1]} />}
    {mode === 'overlay' && <MapCanvas layers={active} opacity />}
    <LayerPanel align="left"  .../>
    <LayerPanel align="right" .../>   // slider mode only
    <MapControls />                   // locate, fullscreen, +, -, measure, settings
  </BandFour>
  <BandFive><TimeScrubber /></BandFive>
</ConsoleShell>
```

**Buttons**

| Element | id | Action |
|---|---|---|
| Add layer | `btn.layer.add` | `CommandDialog` grouped by `LayerDef.group` |
| Close layer chip | `btn.layer.close.{id}` | removes from `?layers=` |
| View mode | `btn.mode.{v}` | sets `?mode=`; slider disabled unless 2 layers |
| Range handle | `handle.range.{min\|max}` | local state, debounced 120ms to paint |
| Swap layer | `select.layer.{side}` | replaces that side's id in `?layers=` |
| Locate | `btn.map.locate` | `geolocate.trigger()` |
| Measure | `btn.map.measure` | activates line-draw tool |
| Export view | `btn.map.export` | PNG of the canvas plus a JSON of the view state |

### `/scorecard` — page id `scorecard.skill`

```
<BandOne title="Scorecard" tabs={['Skill','Issue Review','Data Health']}
         primary={<Button variant="teal" icon="upload">Export report</Button>} />
<BandTwo search scope={<LabelVersionSelect />} />
<BandFour layout="two-column">
  <SkillReportCard>
    <ReportTitle>Skill Report</ReportTitle>
    <MetaRows model labelVersion sampleCount period />
    <MetricBar label="ROC AUC"       value={0.68} max={1} />
    <MetricBar label="PR AUC"        value={0.52} max={1} />
    <MetricBar label="Brier Skill"   value={0.09} max={1} signed />
    <MetricBar label="Reliability"   value={0.81} max={1} />
    <CountyBreakdown />              // thumbnail + % bar per county
  </SkillReportCard>
  <ComparisonPanels>
    <RasterPanel title="Forecast" histogramTop />
    <RasterPanel title="Observed" histogramTop />
    <StatRows />                     // hits, misses, false alarms, correct negatives
    <BigNumbers left="ROC AUC 0.68" right="Brier Skill 0.09" />
  </ComparisonPanels>
</BandFour>
<BelowFold>
  <ReliabilityDiagram />
  <SkillByLeadTime />
  <BaselineBars />                   // climatology, persistence, ENSO-only, ERA5-only, full
</BelowFold>
```

### `/reports` — page id `reports.active`

```
<BandOne title="Field Reports" tabs={['Active','Resolved']}
         primary={<Button variant="teal" icon="plus">Add report</Button>} />
<BandTwo search scope viewToggle={['List','Grid']} />
<BandFour layout="three-column">
  <ReportList sortBy="observedAt">
    <ReportRow />                    // photo, topic icon, date, county, area
    <Footer><Button variant="teal" full>+ Add report</Button></Footer>
  </ReportList>
  <ReportThread>
    <ThreadHeader title topicDot county ward coords />
    <MessageList />                  // avatar, name, timestamp, body
    <Button variant="outline" icon="check">Mark as verified</Button>
    <Composer attach textarea voice />
  </ReportThread>
  <PhotoGrid cols={2} />
</BandFour>
```

**Offline write path**

```ts
async function submitReport(draft: ReportDraft) {
  const id = crypto.randomUUID()
  await idb.set(`report-queue:${id}`, draft)          // survives reload
  queryClient.setQueryData(qk.reports(filter), optimisticInsert(draft))
  if (navigator.onLine) await flushQueue()
}
window.addEventListener('online', flushQueue)
```

### `/triggers` — page id `triggers.thresholds`

```
<TriggerMatrix triggers firingCounts dirty onSave onReset />
```

Editing a cell fires `POST /v1/triggers/preview` debounced 300ms and updates the right-rail counts. Nothing is written until `Save`. `Save` is optimistic with rollback on 409.

---

## 9. Integrations

| Integration | Where | Contract |
|---|---|---|
| **MapLibre GL** | all map pages | vendored at `public/vendor/maplibre-gl.{js,css}`. Never a CDN, the venue wifi will fail |
| **TiTiler** | `/v1/tiles/*` | COG tiles from S3, `?rescale=` and `?colormap=` from `LayerDef` |
| **Groq** | `/v1/chat`, `/v1/bulletin` | server-side only. Numeric verifier runs after generation and before the response leaves the server. A reply containing a numeral not present in the payload is replaced with a fixed refusal |
| **Africa's Talking** | alert delivery | SMS and USSD. Delivery receipts feed `Alert.deliveries` |
| **CAP** | `/v1/issues/:id/export/cap` | OASIS CAP 1.2 XML, one `<info>` per county above trigger |
| **Clerk or WorkOS** | auth | tenant claim in the JWT; every read is tenant-scoped server-side |
| **Sentry** | errors | source maps on, `X-Issue-Id` attached as a tag |

**Chat verifier**, the piece that makes the grounding claim true:

```ts
const allowed = collectNumbers(issue, verification, config)  // Set<string>
const emitted = extractNumerals(reply)                       // string[]
const unknown = emitted.filter(n => !allowed.has(normalise(n)))
if (unknown.length) return REFUSAL                           // never the model's text
```

---

## 10. Scripts

```json
{
  "dev":        "next dev",
  "build":      "next build",
  "typecheck":  "tsc --noEmit",
  "lint":       "eslint . --max-warnings 0",
  "test":       "vitest run",
  "e2e":        "playwright test",
  "vendor:map": "node scripts/vendor-maplibre.mjs",
  "gen:types":  "openapi-typescript http://localhost:8080/openapi.json -o lib/api-types.ts",
  "gen:tiles":  "python scripts/build_cogs.py --issue $ISSUE",
  "verify:ui":  "playwright test tests/offline.spec.ts"
}
```

`verify:ui` loads the console, disables the network, and asserts the map still renders the latest issue. It fails the build if the shell is not offline-capable.

---

## 11. Build order

1. **Shell** — rail, five bands, routing, tokens, skeletons. No data. (2 days)
2. **Counties + issue payload** — real data, list-detail-media, series chart. (3 days)
3. **Maps single mode** — layer registry, tiles, `LayerPanel` with working histogram handles. (4 days)
4. **Slider mode** — `MapSplitSlider`, the forecast-against-observed view. (2 days)
5. **Scorecard** — skill report, reliability, baselines, issue review table. (3 days)
6. **Field Reports** — capture, thread, offline queue. (3 days)
7. **Triggers + Alerts** — matrix, preview, CAP export, delivery states. (3 days)
8. **Stations, Settings, polish** — (3 days)

23 working days for one developer. Steps 1 to 3 give a demoable product; step 4 gives the moment that sells it; step 5 gives the thing no competitor has.
