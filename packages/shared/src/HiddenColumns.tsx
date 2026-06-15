import { HotTable } from '@handsontable/react';
import type { HotTableClass } from '@handsontable/react';
import { useRef } from 'react';

export function HiddenColumns() {
  const hotRef = useRef<HotTableClass>(null);

  const toggleColumn = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const hiddenColumns = hot.getPlugin('hiddenColumns');
    const isHidden = hiddenColumns.isHidden(1);

    if (isHidden) {
      hiddenColumns.showColumn(1);
    } else {
      hiddenColumns.hideColumn(1);
    }

    hot.render();
  };

  return (
    <>
      <button type="button" onClick={toggleColumn}>
        Toggle column B
      </button>

      <HotTable
        ref={hotRef}
        data={[
          ['A1', 'B1', 'C1'],
          ['A2', 'B2', 'C2'],
          ['A3', 'B3', 'C3'],
        ]}
        rowHeaders
        colHeaders={['A', 'B', 'C']}
        hiddenColumns={{
          indicators: true,
        }}
        width="auto"
        height="auto"
        licenseKey="non-commercial-and-evaluation"
      />
    </>
  );
}
