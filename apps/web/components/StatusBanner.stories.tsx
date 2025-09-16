import { StatusBanner } from './StatusBanner';

const meta = {
  title: 'Components/StatusBanner',
  component: StatusBanner,
  args: {
    indicator: 'spinner',
    message: 'Resolving location…',
    tone: 'muted',
  },
};

export default meta;

export const Loading = {
  args: { indicator: 'spinner', message: 'Fetching forecast…', effect: 'shimmer' },
};

export const Success = {
  args: { indicator: 'check', message: 'Confidence 92%' },
};

export const Warn = {
  args: { indicator: 'warn', message: 'Confidence 55%. Try a more specific city & country.' },
};
