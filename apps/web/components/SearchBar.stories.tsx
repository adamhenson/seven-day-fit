import { SearchBar } from './SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  args: {
    placeholder: '"the big apple", "Mission, SF", or a riddle…',
    disabled: false,
  },
};

export default meta;

export const Default = {
  args: {
    onSubmit: (q: string) => alert(`Submit: ${q}`),
  },
};

export const Disabled = {
  args: { disabled: true, onSubmit: () => {} },
};
