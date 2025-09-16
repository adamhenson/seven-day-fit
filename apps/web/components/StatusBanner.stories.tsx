import type { Meta, StoryObj } from '@storybook/nextjs';
import { StatusBanner } from './StatusBanner';

const meta = {
  title: 'Components/StatusBanner',
  component: StatusBanner,
  args: {
    indicator: 'spinner',
    message: 'Resolving location…',
    tone: 'muted',
  },
} satisfies Meta<typeof StatusBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { indicator: 'spinner', message: 'Fetching forecast…', effect: 'shimmer' },
};

export const Success: Story = {
  args: { indicator: 'check', message: 'Confidence 92%' },
};

export const Warn: Story = {
  args: { indicator: 'warn', message: 'Confidence 55%. Try a more specific city & country.' },
};
