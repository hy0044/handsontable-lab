import { HotTable } from '@handsontable/react';
import type { HotTableClass } from '@handsontable/react';
import { useRef, useState } from 'react';

export function UpdateSettings() {
  const hotRef = useRef<HotTableClass>(null);
  const [enabled, setEnabled] = useState(true);

  const toggleHeaders = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    hot.updateSettings({
      rowHeaders: nextEnabled,
      colHeaders: nextEnabled,
    });
  };

  return (
    <>
      <button type="button" onClick={toggleHeaders}>
        Toggle headers
      </button>

      <HotTable
        ref={hotRef}
        data={[
          ['A1', 'B1', 'C1'],
          ['A2', 'B2', 'C2'],
          ['A3', 'B3', 'C3'],
        ]}
        rowHeaders={enabled}
        colHeaders={enabled}
        width="auto"
        height="auto"
        licenseKey="non-commercial-and-evaluation"
      />
    </>
  );
}
