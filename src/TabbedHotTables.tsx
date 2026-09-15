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
}

let nextInstanceId = 0;

function makeData(tab: TabName, rows: number, columns: number) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => `${tab}-${row}-${column}`),
  );
}

export function TabbedHotTables({ rows = 1_000, columns = 20 }: TabbedHotTablesProps) {
  const [activeTab, setActiveTab] = useState<TabName>('A');
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const hotRef = useRef<HotTableRef>(null);
  const data = useMemo(() => makeData(activeTab, rows, columns), [activeTab, rows, columns]);

  const afterInit = useCallback(function (this: Handsontable.Core) {
    const id = ++nextInstanceId;
    setInstanceId(id);
    console.log('[hot-repro] Handsontable instance created', { id, instance: this });
  }, []);

  const beforeChange = useCallback(
    (changes: (Handsontable.CellChange | null)[], source: Handsontable.ChangeSource) => {
      console.log('[hot-repro] beforeChange changes', { tab: activeTab, source, changes });
    },
    [activeTab],
  );

  const selectTab = (tab: TabName) => {
    if (tab === activeTab) return;
    setInstanceId(null);
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
          <HotTable key={activeTab} ref={hotRef} data={data} rowHeaders colHeaders width="100%"
            height={480} licenseKey="non-commercial-and-evaluation"
            afterInit={afterInit} beforeChange={beforeChange} />
        </div>
      </section>
    </main>
  );
}
