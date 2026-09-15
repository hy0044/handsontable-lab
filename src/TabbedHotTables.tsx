import { useCallback, useMemo, useRef, useState } from 'react';
import { HotTable, type HotTableRef } from '@handsontable/react-wrapper';
import type Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

registerAllModules();

export type TabName = 'A' | 'B';

export interface TabbedHotTablesProps {
  rows?: number;
  columns?: number;
  reuseInstance?: boolean;
}

let nextInstanceId = 0;
const instanceIds = new WeakMap<Handsontable.Core, number>();

function makeData(tab: TabName, rows: number, columns: number) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => `${tab}-${row}-${column}`),
  );
}

function logCellState(
  phase: 'before cell click' | 'after cell click',
  hot: Handsontable.Core,
  row: number,
  column: number,
  cell: HTMLTableCellElement,
) {
  const meta = hot.getCellMeta(row, column);
  console.log(`[hot-repro] ${phase}`, {
    activeElement: document.activeElement,
    cellIsConnected: cell.isConnected,
    cellMetaReadOnly: meta.readOnly,
    cellMetaEditor: meta.editor,
    instanceId: instanceIds.get(hot),
    settingsReadOnly: hot.getSettings().readOnly,
  });
}

export function TabbedHotTables({
  rows = 1_000,
  columns = 20,
  reuseInstance = false,
}: TabbedHotTablesProps) {
  const [activeTab, setActiveTab] = useState<TabName>('A');
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const hotRef = useRef<HotTableRef>(null);
  const data = useMemo(() => makeData(activeTab, rows, columns), [activeTab, rows, columns]);

  const afterInit = useCallback(function (this: Handsontable.Core) {
    const id = ++nextInstanceId;
    instanceIds.set(this, id);
    setInstanceId(id);
    console.log('[hot-repro] Handsontable instance created', { id, instance: this });
  }, []);

  const beforeChange = useCallback(
    function (this: Handsontable.Core, changes: (Handsontable.CellChange | null)[], source: Handsontable.ChangeSource) {
      const firstChange = changes?.find((change) => change !== null);
      const meta = firstChange ? this.getCellMeta(firstChange[0], Number(firstChange[1])) : undefined;
      console.log('[hot-repro] beforeChange changes', {
        tab: activeTab,
        source,
        changes,
        instanceId: instanceIds.get(this),
        cellMetaReadOnly: meta?.readOnly,
        cellMetaEditor: meta?.editor,
        settingsReadOnly: this.getSettings().readOnly,
      });
    },
    [activeTab],
  );

  const selectTab = (tab: TabName) => {
    if (tab === activeTab) return;
    if (!reuseInstance) setInstanceId(null);
    setActiveTab(tab);
  };

  return (
    <main>
      <h1>Handsontable tab focus race reproduction</h1>
      <p>Switch tabs, click a cell, and immediately enter a value. No artificial wait is used.</p>
      <div className="tabs" role="tablist" aria-label="Data tabs">
        {(['A', 'B'] as const).map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`} onClick={() => selectTab(tab)}>
            Tab {tab}
          </button>
        ))}
      </div>
      <section id={`panel-${activeTab}`} role="tabpanel" aria-label={`Tab ${activeTab}`}
        data-testid="hot-panel" data-tab={activeTab} data-instance-id={instanceId ?? ''}>
        <div className="ht-theme-main">
          <HotTable key={reuseInstance ? 'shared' : activeTab} ref={hotRef} data={data}
            readOnly={activeTab === 'A'} rowHeaders colHeaders width="100%"
            height={480} licenseKey="non-commercial-and-evaluation"
            afterInit={afterInit} beforeChange={beforeChange}
            beforeOnCellMouseDown={(_event, coords, cell) => {
              const hot = hotRef.current?.hotInstance;
              if (hot && coords.row !== null && coords.col !== null && coords.row >= 0 && coords.col >= 0) {
                logCellState('before cell click', hot, coords.row, coords.col, cell);
              }
            }}
            afterOnCellMouseDown={(_event, coords, cell) => {
              const hot = hotRef.current?.hotInstance;
              if (hot && coords.row !== null && coords.col !== null && coords.row >= 0 && coords.col >= 0) {
                logCellState('after cell click', hot, coords.row, coords.col, cell);
              }
            }} />
        </div>
      </section>
    </main>
  );
}
