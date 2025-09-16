import type { Meta, StoryObj } from '@storybook/types';
import { Toast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    message: 'Hello from a toast!',
    durationMs: 999999,
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
