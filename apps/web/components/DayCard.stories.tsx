import type { Meta, StoryObj } from '@storybook/react';
import { DayCard } from './DayCard';

const meta = {
  title: 'Components/DayCard',
  component: DayCard,
} satisfies Meta<typeof DayCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    day: {
      dateISO: '2025-09-16',
      high: 76,
      low: 58,
      feelsLikeHigh: 74,
      precipType: 'none',
      pop: 0.1,
      wind: 8,
      maxGust: 18,
      uvIndex: 6,
      summary: 'overcast',
    },
    outfit: ['MILD_CASUAL'],
    notes: ['light layer AM/PM'],
  },
  decorators: [
    (Story) => (
      <div className='w-2xs'>
        <Story />
      </div>
    ),
  ],
};
