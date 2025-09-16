import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  args: {
    placeholder: '"the big apple", "Mission, SF", or a riddle…',
    disabled: false,
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (q: string) => alert(`Submit: ${q}`),
  },
};

export const Disabled: Story = {
  args: { disabled: true, onSubmit: () => {} },
};
