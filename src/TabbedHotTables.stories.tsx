import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TabbedHotTables } from './TabbedHotTables';

type StoryArgs = ComponentProps<typeof TabbedHotTables> & {
  repetitions: number;
  inputDelay: number;
  reuseInstance: boolean;
};

const meta = {
  title: 'Reproductions/Tabbed Handsontable focus race',
  component: TabbedHotTables,
  args: { rows: 1_000, columns: 20, repetitions: 5, inputDelay: 0, reuseInstance: false },
  argTypes: {
    rows: { control: { type: 'number', min: 1, step: 1 } },
    columns: { control: { type: 'number', min: 1, step: 1 } },
    repetitions: { control: { type: 'number', min: 1, step: 1 } },
    inputDelay: { control: { type: 'number', min: 0, step: 1 } },
    reuseInstance: { control: 'boolean' },
  },
  render: ({ repetitions: _repetitions, inputDelay: _inputDelay, ...args }) =>
    <TabbedHotTables {...args} />,
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function playFocusRace(expectInstanceReuse: boolean) {
  return async ({ canvasElement, args }: { canvasElement: HTMLElement; args: StoryArgs }) => {
    const canvas = within(canvasElement);
    let previousInstanceId = canvas.getByTestId('hot-panel').dataset.instanceId;

    for (let iteration = 0; iteration < args.repetitions; iteration += 1) {
      if (iteration > 0) {
        await userEvent.click(canvas.getByRole('tab', { name: 'Tab A' }));
      }
      const tabButton = canvas.getByRole('tab', { name: 'Tab B' });
      await userEvent.click(tabButton);
      let panel = canvas.getByTestId('hot-panel');
      await waitFor(() => {
        panel = canvas.getByTestId('hot-panel');
        expect(panel).toHaveAttribute('data-tab', 'B');
        expect(panel.dataset.instanceId).toBeTruthy();
      });
      const instanceId = panel.dataset.instanceId;

      const cell = panel.querySelector<HTMLTableCellElement>('tbody tr:first-child td');
      await expect(cell).not.toBeNull();
      if (!cell) throw new Error('Target Handsontable cell was not rendered');

      console.log('[hot-repro] test immediately before cell click', {
        iteration, tab: 'B', activeElement: document.activeElement,
        cellIsConnected: cell.isConnected, previousInstanceId, instanceId,
      });
      await userEvent.click(cell);
      console.log('[hot-repro] test immediately after cell click', {
        iteration, tab: 'B', activeElement: document.activeElement,
        cellIsConnected: cell.isConnected, previousInstanceId, instanceId,
      });
      await userEvent.keyboard('1', { delay: args.inputDelay });
      await userEvent.keyboard('{Enter}', { delay: args.inputDelay });

      if (expectInstanceReuse) {
        await expect(previousInstanceId).toBe(instanceId);
      } else {
        await expect(previousInstanceId).not.toBe(instanceId);
      }
      previousInstanceId = instanceId;
    }
  };
}

export const RemountedInstance: Story = {
  args: { reuseInstance: false },
  play: playFocusRace(false),
};

export const ReusedInstance: Story = {
  args: { reuseInstance: true },
  play: playFocusRace(true),
};
