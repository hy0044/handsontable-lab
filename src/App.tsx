import { useRef, useState } from 'react';
import { HotTable, type HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

registerAllModules();

const initialData = [['A'], ['B'], ['C'], ['D'], ['E']];
const updatedData = [['F'], ['G'], ['H']];

export default function App() {
  const hotRef = useRef<HotTableRef>(null);
  const [data, setData] = useState(initialData);

  const applyFilter = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const filters = hot.getPlugin('filters');
    filters.clearConditions();
    filters.addCondition(0, 'by_value', [['A', 'B']]);
    filters.filter();
  };

  const replaceData = () => {
    setData(updatedData.map((row) => [...row]));
  };

  return (
    <main>
      <h1>Handsontable v18 filter + data update repro</h1>
      <p>
        1. Apply filter. 2. Replace data through React state. Check whether Handsontable crashes.
      </p>

      <div className="controls">
        <button type="button" onClick={applyFilter}>
          Apply filter (A / B)
        </button>
        <button type="button" onClick={replaceData}>
          Replace data
        </button>
      </div>

      <div className="ht-theme-main">
        <HotTable
          ref={hotRef}
          data={data}
          filters
          dropdownMenu
          rowHeaders
          colHeaders={['Value']}
          width={360}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </main>
  );
}
