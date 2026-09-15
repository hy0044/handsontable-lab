import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { TabbedHotTables, type TabName } from './TabbedHotTables';

type StoryArgs = ComponentProps<typeof TabbedHotTables> & {
  repetitions: number;
  inputDelay: number;
};

const meta = {
  title: 'Reproductions/Tabbed Handsontable focus race',
  component: TabbedHotTables,
  args: { rows: 1_000, columns: 20, repetitions: 5, inputDelay: 0 },
  argTypes: {
    rows: { control: { type: 'number', min: 1, step: 1 } },
    columns: { control: { type: 'number', min: 1, step: 1 } },
    repetitions: { control: { type: 'number', min: 1, step: 1 } },
    inputDelay: { control: { type: 'number', min: 0, step: 1 } },
  },
  render: ({ repetitions: _repetitions, inputDelay: _inputDelay, ...args }) =>
    <TabbedHotTables {...args} />,
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusRace: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    let previousInstanceId = canvas.getByTestId('hot-panel').dataset.instanceId;

    for (let iteration = 0; iteration < args.repetitions; iteration += 1) {
      const tab: TabName = iteration % 2 === 0 ? 'B' : 'A';
      const tabButton = canvas.getByRole('tab', { name: `Tab ${tab}` });
      await userEvent.click(tabButton);
      let panel = canvas.getByTestId('hot-panel');
      await waitFor(() => {
        panel = canvas.getByTestId('hot-panel');
        expect(panel).toHaveAttribute('data-tab', tab);
        expect(panel.dataset.instanceId).toBeTruthy();
      });
      const instanceId = panel.dataset.instanceId;

      const cell = panel.querySelector<HTMLTableCellElement>('tbody tr:first-child td');
      await expect(cell).not.toBeNull();
      if (!cell) throw new Error('Target Handsontable cell was not rendered');

      console.log('[hot-repro] before cell interaction', {
        iteration, tab, activeElement: document.activeElement, cellOuterHTML: cell.outerHTML,
        cellIsConnected: cell.isConnected, sameCellDom: true, previousInstanceId, instanceId,
        instanceChanged: previousInstanceId !== instanceId,
      });
      await userEvent.click(cell);
      await userEvent.keyboard('1', { delay: args.inputDelay });
      await userEvent.keyboard('{Enter}', { delay: args.inputDelay });

      const cellAfter = panel.querySelector<HTMLTableCellElement>('tbody tr:first-child td');
      console.log('[hot-repro] after cell interaction', {
        iteration, tab, activeElement: document.activeElement, cellOuterHTML: cellAfter?.outerHTML,
        cellIsConnected: cell.isConnected, sameCellDom: cell === cellAfter, previousInstanceId,
        instanceId, instanceChanged: previousInstanceId !== instanceId,
      });
      await expect(previousInstanceId).not.toBe(instanceId);
      previousInstanceId = instanceId;
    }
  },
};
