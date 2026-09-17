import { HotTable } from '@handsontable/react-wrapper';
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
  return (
    <main>
      <h1>Handsontable v18 merge cells + filter repro</h1>
      <p>
        Open a column menu, change a filter, and check the console for an assertion error.
      </p>

      <div className="ht-theme-main">
        <HotTable
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
