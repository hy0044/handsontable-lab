# Handsontable 18.1.0 + React 19 focus race reproduction

This repository contains the original filter/data-update reproduction and a Storybook interaction test for a CI-only cell editing race. The dependency versions are intentionally pinned to Handsontable `18.1.0` and React `19.2.7`.

## Install and run

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
pnpm storybook
```

Open **Reproductions / Tabbed Handsontable focus race** in Storybook. Storybook 10's
Test addon displays the play function and its interaction/test results in the **Tests**
panel. Run the test from that panel, or enable automatic test execution there. The
story's controls expose:

- `rows` and `columns`: increase these to make creation of each grid more expensive;
- `repetitions`: choose how often the test alternates between Tab A and Tab B;
- `inputDelay`: delay, in milliseconds, passed directly to each `userEvent.keyboard` call. It defaults to `0`; the test deliberately has no sleep or arbitrary wait.

Each tab change keys the `HotTable` by the active tab. React therefore unmounts the old grid and creates a distinct Handsontable instance for the new tab.

## Interaction test

The play function repeatedly switches tabs, obtains the first rendered cell, clicks it, and immediately calls:

```ts
await userEvent.keyboard('1', { delay: inputDelay });
await userEvent.keyboard('{Enter}', { delay: inputDelay });
```

Browser/test-runner output includes `document.activeElement`, the cell's `outerHTML` and `isConnected` state, whether the cell DOM is still identical after input, whether the instance ID changed, and every `beforeChange` changes array. In the failing case, inspect these logs for focus remaining on the tab button and a change shaped like `[row, column, "", ""]`.

Build and run the Storybook 10 test headlessly in Chromium with the Vitest addon:

```bash
pnpm build
pnpm build-storybook
pnpm test-storybook:ci
```

The headless test uses the same stories and play functions as the Storybook UI; it does
not require a separately running static Storybook server. For an interactive Vitest run,
use:

```bash
pnpm test-storybook
```

`vitest.config.ts` registers the Storybook test plugin and Playwright's Chromium
browser provider. `.storybook/main.ts` registers `@storybook/addon-vitest`, which adds
the Tests panel and connects its results to Storybook.

## Memory-constrained CI runs

Set `NODE_OPTIONS` on both the Storybook build and test process to reproduce resource-constrained CI. Start with 512 MiB and then try 256 MiB:

```bash
NODE_OPTIONS=--max-old-space-size=512 pnpm build-storybook
NODE_OPTIONS=--max-old-space-size=512 pnpm test-storybook:ci

NODE_OPTIONS=--max-old-space-size=256 pnpm build-storybook
NODE_OPTIONS=--max-old-space-size=256 pnpm test-storybook:ci
```

An out-of-memory exit at lower limits is a resource result, not evidence of the focus race. Keep `inputDelay=0` for the first reproduction attempts; only vary delay after recording the baseline.

## Original filter reproduction

Run `pnpm dev`, click **Apply filter (A / B)**, then **Replace data**, and inspect the browser console and grid. React `StrictMode` remains enabled in `src/main.tsx`.
