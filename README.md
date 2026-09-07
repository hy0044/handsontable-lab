# Handsontable v18 filter + data update repro

Minimal React reproduction for a Handsontable v18 crash when the `data` prop is replaced while a filter is active.

## Run

```bash
pnpm install
pnpm dev
```

## Reproduction

1. Click **Apply filter (A / B)**.
2. Click **Replace data**.
3. Check the browser console and the grid state.

The data replacement is done through React state, so the new array is passed back to `<HotTable data={data} />` as a prop.

Versions are intentionally fixed to:

- `handsontable@18.1.0`
- `@handsontable/react-wrapper@18.1.0`
