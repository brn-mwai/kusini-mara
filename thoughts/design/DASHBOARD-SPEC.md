---
type: design
status: draft
created: 2026-08-11
task: Cascade Bridge operator console - page by page specification
structure: follows the Fieldwise IA grammar exactly
---

# Cascade Bridge Console - page specification

Every page follows the same five-band shell. Deviating from it is a bug.

## The shell

```
+--+------------------------------------------------------------------+
|  | BAND 1  PageTitle | Tab  Tab  Tab                 [PrimaryAction] |
|R |------------------------------------------------------------------|
|A | BAND 2  [search................] [filter] [ScopeSelect v] [...]   |
|I |------------------------------------------------------------------|
|L | BAND 3  chip x | chip x | +          Single Multi Slider Overlay  |
|  |------------------------------------------------------------------|
|  | BAND 4  content                                                   |
|  |------------------------------------------------------------------|
|  | BAND 5  [cal] 1M 3M 1Y | < Sep Oct Nov > timeline scrubber        |
+--+------------------------------------------------------------------+
```

| Band | Rule |
|---|---|
| 1 | Page title, vertical divider, tabs (max 4), teal filled primary action far right |
| 2 | Full-width search, filter icon, scope dropdown (All counties / one county), overflow `...` |
| 3 | Only on map pages. Layer chips with close X, `+` to add, view-mode segmented control right |
| 4 | Either full-bleed map, or three-column list-detail-media |
| 5 | Only on time-varying pages. Period tabs plus month pills |

**Rail.** 56px collapsed, 250px expanded on hamburger. Groups separated by hairlines.

```
COUNTIES          county-outline icon
STATIONS          antenna icon
──────
MAPS              map icon
VEGETATION        sprout icon
RAINFALL          rain icon
SOIL MOISTURE     layers icon
OUTLOOK           sun-cloud icon
──────
FIELD REPORTS     pin icon
TRIGGERS          calendar icon
SCORECARD         bar-chart icon
──────
ALERTS            bell icon
SETTINGS          gear icon
avatar
```

## Tokens

Dark ground `#0D1317`, surface `#141C21`, hairline `#26333B`, teal accent `#22C7A9`.
Drought scale `#B24A2C`, watch `#D9A84E`, normal `#4FA987`, no-coverage `#39474F`.
Mono for every number, `font-variant-numeric: tabular-nums`. Never switch fonts.

---

# 1. COUNTIES

Equivalent of Fieldwise Fields. The asset list.

**Band 1** `Counties` | tabs: `Map` `Table` | action `+ Add county`
**Band 2** search "Search county, region, forecast" | scope `All regions v`
**Band 4** three columns

**Left column - county list** (scroll)
Row per county:
- 64px thumbnail, county shape tinted by current probability
- County name, region name below
- Right: `P 0.243` mono, delta arrow against last issue
- Status pill: `Drought` / `Watch` / `Normal` / `No coverage`
- Counties covered by no model render greyed with a dashed border

Footer: teal full-width `+ Add county`

**Centre - county detail**
- `X` close, `><` collapse, `...` overflow
- Title = county name, area in km2, population, coordinates right-aligned
- Status pill and current issue reference `Issue 2026-08`
- Metric rows, each with sparkline thumbnail:

| Row | Value | Trend |
|---|---|---|
| Drought probability | 0.243 | +0.02 |
| Ensemble agreement | 33 of 51 | |
| VCI3M | 31.4 | -4.2 |
| Rainfall anomaly | -38% | |
| Land temp anomaly | +1.9 C | |

- Period tabs `1M 3M 6M 1Y 2Y 5Y`
- Time series chart: probability line, p10-p90 band shaded, threshold as horizontal dashed rule, drought episodes shaded in the background

**Right - map** county polygon on satellite, neighbours dimmed

**Table tab** columns: County, Region, Probability, p10, p90, Members above, VCI3M, Signal, Lead, Issue. Sortable. Sticky header.

---

# 2. STATIONS

Equivalent of Sensors. Ground truth inputs.

**Band 1** `Stations` | tabs: `Activity` `Coverage` | action `+ Add station`
**Band 2** search | scope `All counties v`
**Band 3** filter chips: `All` `Rain gauge` `Weather` `Water point` `Market` `Field observer`

**Left column** header row `All stations  118` with two counters `85 reporting` `33 stale`.
Row per station: thumbnail, name, type with icon, freshness %, battery, signal bars, green check or amber warning.
Footer teal `+ Add station`.

**Centre - station detail**
- Name, type chip, coordinates, `Active` toggle
- `Installed` and `Last reading` with relative time
- Two progress bars: Signal %, Battery %
- Variable selector dropdown (`Rainfall (mm) v`)
- Period tabs `1W 1M 3M 6M 1Y 2Y`
- Line chart, two series max, delta callout `+5% in the last 7 days`

**Right** satellite map with station pin

---

# 3. MAPS

The core page. Equivalent of Fieldwise Maps.

**Band 1** `Maps` | tabs: `Layer Explorer` `Forecast Issues` `Saved Views` | action `+ New view`

## 3a. Layer Explorer

**Band 3** layer chips, closable, `+` opens the layer picker. View modes `Single | Multi | Slider | Overlay`.

**Layer catalogue** (the `+` picker, grouped)

| Group | Layers |
|---|---|
| Forecast | Drought probability, Ensemble agreement, p10, p90, Tercile below-normal |
| Observed | VCI3M, NDVI, NDVI anomaly, CHIRPS rainfall, Rainfall anomaly, LST day, LST anomaly, Soil moisture |
| Bridge output | Predicted rainfall, Predicted NDVI, Predicted LST |
| Error | Forecast minus observed, Absolute error, Brier contribution |
| Context | County boundaries, Livelihood zones, Water points, Population |

**Layer panel** floating top-left over the map, one per active layer:
- Collapse arrows `> <`, layer name, `v` to swap layer
- Open-in-new and calendar icons top-left of the panel
- Vertical histogram of the value distribution, teal gradient fill
- Two draggable circular handles setting display min and max
- Axis labels down the side
- Bottom: crop/region chip, then two stats — `0,243 P(drought)` and `12 340 km2 Area`

**Slider mode** two panels, one per side, white vertical divider with grab handle. Panel A left-aligned, panel B right-aligned. This is the mode for **forecast against observed**, and it is the single most persuasive view in the product.

**Multi mode** 2 or 4 synchronised map tiles, shared zoom and pan.

**Overlay mode** stacked with per-layer opacity sliders.

**Map controls** bottom-right vertical stack: locate, fullscreen, zoom in, zoom out, measure, layer settings.

**Band 5** period tabs `1M 3M 1Y`, then month pills `Sep Oct Nov`, arrows either side. Selected pill is teal.

## 3b. Forecast Issues

Card grid, equivalent of VRA Prescription Maps.

**Band 2** search issues | scope | `List | Grid` toggle
**Band 3** filter chips `All issues` `Published` `Verified` `Superseded`, sort `Date`

Card:
- Thumbnail of the probability map at issue time
- Open-in-new and `...` top-right on hover
- Region dot, `Issue 2026-08`, init date right
- Chip row: `SEAS5 51 members`, `Lead 1-3`
- Bottom line: `Verified  Brier 0.19` or `Awaiting truth  Nov 2026`

Clicking opens the immutable issue detail: the exact payload, the model version, the content hash, and a `Download NetCDF / GeoTIFF / CAP` button group.

## 3c. Saved Views

Folder tree left (`All views`, user folders, `+ Add folder`), thumbnail grid right. Same card grammar.

---

# 4. VEGETATION

Equivalent of Growth. Single-layer deep dive, NDVI and VCI3M.

**Band 1** `Vegetation` | scope select `County v` inline with title
**Band 2** search layer, county
**Left column**
- Layer header `VCI3M  3-month Vegetation Condition Index`
- `All counties` summary row: mean value, total area, delta
- Row per county: thumbnail, name, area, `31,4 VCI3M`, delta arrow, risk pill `Severe / Moderate / Normal`
**Centre** full-bleed map, contoured raster
**Right (phone breakpoint)** horizontal histogram with the two range handles and the NDVI axis
**Band 5** `1M 3M 1Y 5Y` and month pills

The NDMA class boundaries are drawn as fixed ticks on the histogram: 10, 20, 35. Non-negotiable, they are what the user acts on.

---

# 5. RAINFALL, 6. SOIL MOISTURE, 7. OUTLOOK

Identical grammar to Vegetation, different layer and units.

- **Rainfall** CHIRPS observed mm, anomaly %, SPI-3 and SPI-6 as extra chips
- **Soil moisture** volumetric %, two depths as two series
- **Outlook** SEAS5 ensemble. Adds a right rail the others do not have:
  - `ENSO state` gauge with Nino3.4 value and phase
  - `IOD state` gauge with Dipole Mode Index
  - Ensemble spaghetti plot, 51 thin lines plus a bold mean
  - Tercile bars per county, below / near / above normal

---

# 8. FIELD REPORTS

Equivalent of Scouting. This is the page that fixes the labels.

**Band 1** `Field Reports` | tabs: `Active` `Resolved` | action `+ Add report`
**Band 2** search | scope | `List | Grid`

**Left column** sorted by date. Row: photo thumbnail, topic icon and name, date and time, county, area.
Footer teal `+ Add report`.

**Centre - report thread**
- Title, e.g. `Pasture failure - Loiyangalani`
- Topic dot and label, county, ward, coordinates
- Message entries: avatar, name, timestamp, body text
- `Mark as verified` button, top right of the thread
- Composer at the bottom: attachment, text field, voice note

**Right** photo grid, 2x2, tap to expand. Location pin map above.

**Report topics** (chips on the create form)
`Pasture` `Water point` `Livestock condition` `Migration` `Market price` `Crop failure` `+ New topic`

**Create form (mobile first)**
Topic chips, photo grid with delete X, `Camera` and `Photo Library` buttons, teal full-width `Save report`. Offline queue with a pending badge, syncs when signal returns.

**Why this page exists.** Each verified report becomes a labelled observation. Ten counties reporting monthly is 120 ground-truth points a year, which is the answer key the models currently lack.

---

# 9. TRIGGERS

Equivalent of Planner. Thresholds and what fires at each.

**Band 1** `Triggers` | tabs: `Thresholds` `Action Plans` `Timeline` `Recipients` | action `+ Add trigger`

**Thresholds tab**
Row per tenant, column per level. Editable numeric cells:

| Tenant | Advisory | Watch | Warning | Emergency |
|---|---|---|---|---|
| Turkana county | 0.15 | 0.25 | 0.40 | 0.60 |
| Anticipatory fund | 0.20 | 0.35 | 0.50 | 0.70 |

Right rail: a live count of how many counties would fire at each level under the current issue. Editing a cell updates the counts instantly. Nothing is written until `Save`.

**Timeline tab**
Gantt. Row per county with thumbnail, columns are months, coloured bars per phase with label and date range. Vertical "today" line. Right rail: stacked bar of counties per phase, then a ranked list with percentage bars.

Period control `6M 1Y 2Y 3Y MAX`.

**Action Plans tab**
Per trigger level, an ordered checklist of what happens: who is notified, which channel, what document generates, which fund unlocks.

---

# 10. SCORECARD

Equivalent of Analytics. The differentiator.

**Band 1** `Scorecard` | tabs: `Skill` `Issue Review` `Data Health` | action `Export report`

## Skill tab

**Left panel - report card**
- `Skill Report`, period chip
- Model version, label version, sample count
- Headline metrics as rows with progress bars: ROC AUC, PR AUC, Brier Skill Score, Reliability
- Below: per-county thumbnails with a percentage bar each

**Right - two panels side by side**, exactly the Harvest Report layout:
- Left `Forecast` with its histogram strip above the map
- Right `Observed` with its own histogram strip
- Under each, a coloured bar and four stat rows
- Two big numbers at the foot: `ROC AUC 0.68` and `Brier Skill 0.09`

**Below the fold**
- Reliability diagram, predicted probability against observed frequency, diagonal reference
- Skill against lead time, 1 to 3 months, with the climatology baseline drawn flat
- Baseline comparison bars: climatology, persistence, ENSO-only, ERA5-only, full model

## Issue Review tab

One row per past issue: issue id, init date, what was forecast, what happened, Brier, hit or miss, and a `?` where truth has not arrived. This table is public. It is the reason nobody has to take an accuracy claim on trust.

## Data Health tab

- Feature coverage: how many of the model inputs were real against zero-filled, per run
- Ingest freshness per source with a staleness clock
- Label version history and what changed
- Point-in-time violations, which should always read zero

---

# 11. ALERTS

Inbox. Row: severity dot, county, trigger crossed, channel icons showing delivery state, timestamp, acknowledgement state. Filter chips `All` `Unread` `Acknowledged` `Failed`. Detail pane shows the exact payload sent and the CAP XML.

# 12. SETTINGS

Tabs: `Organisation` `Members` `API keys` `Data sources` `Export`.
API keys page shows the ingest endpoints, per-key rate limits and last-used timestamps. Export page offers scheduled NetCDF, GeoTIFF and CAP delivery to an S3 bucket or endpoint the tenant nominates.

---

# Component inventory

Reused from Oryn's shadcn set: `card` `badge` `button` `tabs` `dialog` `drawer` `dropdown-menu` `select` `combobox` `data-table` `chart` `progress` `avatar` `separator` `resizable` `hover-card` `popover` `command` `empty` `skeleton`.

New components to build:

1. `LayerPanel` - histogram with two draggable range handles, axis, legend chip, two-stat footer
2. `ViewModeToggle` - Single / Multi / Slider / Overlay
3. `MapSplitSlider` - two synchronised MapLibre instances with a drag divider
4. `TimeScrubber` - period tabs plus month pills
5. `IconRail` - collapsed to expanded drawer with grouped items
6. `MetricRow` - thumbnail, label, value, delta arrow, risk pill
7. `EnsembleFan` - 51 member lines plus mean plus p10-p90 band
8. `ReliabilityDiagram` - binned predicted against observed with the diagonal
9. `TriggerMatrix` - editable threshold grid with a live firing count
10. `ReportThread` - message list with photo grid and composer

# Map layer implementation

MapLibre GL, vector county boundaries, raster tiles for the gridded fields served as COGs through TiTiler. Every layer declares `id`, `unit`, `domain`, `colour ramp`, `class breaks` and `source issue`. Class breaks are data, never hardcoded in a component, so NDMA thresholds change in one place.

# States every page must define

Loading skeleton, empty, no-coverage, stale-data banner, offline banner, error with retry. The current dashboard already does the honest version of no-coverage; keep it.
