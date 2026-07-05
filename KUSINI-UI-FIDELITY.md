# UI fidelity workflow — live-capture as the oracle

`Claude_brain/projects/twenty-ui/live-capture/` = 43 self-contained rendered-HTML snapshots of
the LIVE brian.twenty.com (dark theme, 2026-07-05): every list page, record detail, all table
dropdowns/menus/inline editors, command menu, all settings pages. Full DOM + every CSS rule
inlined. Open in a browser for the exact rendered state; the first HTML comment holds the URL.

## Why it is authoritative
- Same twenty-ui SCSS-module classes as our vendored package (verified: `_chip_rlx2a_1`,
  `_root_2ofqu_1` Avatar, `_overflowingText_137ao_21`) -> vendored components inherit fidelity.
- App-chrome (record table, nav, view bar) is Linaria-hashed classes whose exact values live in
  the captured CSS + inline custom-property bindings (e.g. record-chip gap = `--t-spacing-0_5`).

## Method (per surface)
1. Open the matching capture (e.g. `companies-list.html` for tables, `dropdown-filter.html`
   for menus, `table-row-selected-actionbar.html` for the bulk bar, `command-menu-open.html`).
2. Locate the element in DOM (search visible text), read its class + inline `--s*` vars.
3. Grep the trailing `<style data-captured-css>` for those classes -> exact px/token values.
4. Diff against our scss; adjust to the captured values (tokens over px where a `--t-*` var
   is referenced).

## Extraction backlog (per capture -> our component)
- companies-list.html -> RecordTable (cell paddings, separators, header, footer calc row)
- dropdown-{filter,sort,options,view-picker,calculate,column-header-menu}.html -> Dropdown panel + menu metrics
- table-row-selected-actionbar.html -> bulk action bar
- table-cell-inline-editor.html -> inline cell editor (planned)
- command-menu-open.html -> the K-menu (planned)
- {company,person}-record-detail.html -> RecordPanel/record page field rows + relation cards
- settings-*.html -> Settings shell (own sidebar, form cards, danger zone)
