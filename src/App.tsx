import { useRef } from 'react';
import { HotTable, type HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

registerAllModules();

const data = [
  ['North', 'Q1', 120],
  ['North', 'Q2', 95],
  ['South', 'Q1', 80],
  ['South', 'Q2', 110],
  ['West', 'Q1', 70],
];

export default function App() {
  const hotRef = useRef<HotTableRef>(null);

  const deselectAllFilterValues = () => {
    const filters = hotRef.current?.hotInstance?.getPlugin('filters');

    filters?.addCondition(0, 'by_value', [[]]);
    filters?.filter();
  };

  const clearMergeCells = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    hot.updateSettings({ mergeCells: [] });
  };

  return (
    <main>
      <h1>Handsontable v18 merge cells + filter repro</h1>
      <p>Deselect all filter values, then clear mergeCells and check the console.</p>

      <div className="controls">
        <button type="button" onClick={deselectAllFilterValues}>
          Deselect all filter values
        </button>
        <button type="button" onClick={clearMergeCells}>
          Clear mergeCells
        </button>
      </div>

      <div className="ht-theme-main">
        <HotTable
          ref={hotRef}
          data={data}
          filters
          dropdownMenu
          mergeCells={[{ row: 0, col: 0, rowspan: 2, colspan: 1 }]}
          rowHeaders
          colHeaders={['Region', 'Quarter', 'Sales']}
          width={520}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </main>
  );
}
