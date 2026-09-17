# Handsontable v18 merge cells + filter repro

Minimal React reproduction for a Handsontable v18 issue that can occur when filtering a table containing merged cells.

## Run

```bash
pnpm install
pnpm dev
```

## Reproduction

1. Click **Deselect all filter values**.
2. Confirm that no data rows are displayed.
3. Click **Clear mergeCells**.
4. Check the browser console for the assertion error.

The first button applies a `by_value` filter with no selected values, which is equivalent to opening the first column's filter dropdown and deselecting **Select all**. It intentionally does not clear the filter condition. The second button calls `hot.updateSettings({ mergeCells: [] })`.

The first two cells in the **Region** column are merged. The table enables both the `mergeCells` and `filters` plugins. On Handsontable 18.1.1, the last step throws:

```text
Assertion failed: Expecting an unsigned number.
```

The stack trace may involve `LazyFactoryMap.obtain`, `CellMeta.getMeta`, `MetaManager.getCellMetaKeyValue`, `Core.removeCellMeta`, and `mergeCells`. This project only reproduces the issue; it does not attempt to fix Handsontable.

Versions are intentionally fixed to:

- `handsontable@18.1.1`
- `@handsontable/react-wrapper@18.1.1`
- `react@19.2.7`
- `react-dom@19.2.7`
