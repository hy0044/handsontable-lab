import { HotTable, HotTableClass } from '@handsontable/react';
import { useRef } from 'react';
import { registerAllModules } from 'handsontable/registry';

// register Handsontable's modules
registerAllModules();

type Props = {
  themeName?: string;
};

export function FilterRestore({ themeName }: Props) {
  const hotRef = useRef<HotTableClass>(null);

  const applyFilter = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const filters = hot.getPlugin('filters');

    filters.clearConditions();
    filters.addCondition(0, 'by_value', [['A', 'B']]);
    filters.filter();
  };

  return (
    <>
      <button type="button" onClick={applyFilter}>
        Filter
      </button>

      <HotTable
        ref={hotRef}
        data={[['A'], ['B'], ['C'], ['D'], ['E']]}
        filters
        dropdownMenu
        rowHeaders
        colHeaders={['Value']}
        width="auto"
        height="auto"
        licenseKey="non-commercial-and-evaluation"
        themeName={themeName}
      />
    </>
  );
}
