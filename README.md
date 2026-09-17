# Handsontable v18 merge cells + filter repro

Minimal React reproduction for a Handsontable v18 issue that can occur when filtering a table containing merged cells.

## Run

```bash
pnpm install
pnpm dev
```

## Reproduction

1. Open a column dropdown menu.
2. Select **Filter by value** (or another filter option) and change the filter.
3. Click **OK** to apply it.
4. Check the browser console and the grid state.

The first two cells in the **Region** column are merged. The table enables both the `mergeCells` and `filters` plugins, with `dropdownMenu` providing the filter UI. The issue under investigation may report an error similar to:

```text
Assertion failed: Expecting an unsigned number.
```

The stack trace may involve `LazyFactoryMap.obtain`, `CellMeta.getMeta`, `MetaManager.getCellMetaKeyValue`, `Core.removeCellMeta`, and `mergeCells`. This project only reproduces the issue; it does not attempt to fix Handsontable.

Versions are intentionally fixed to:

- `handsontable@18.1.1`
- `@handsontable/react-wrapper@18.1.1`
- `react@19.2.7`
- `react-dom@19.2.7`
