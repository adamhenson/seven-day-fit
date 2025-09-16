import type { TDayWeather } from '@seven-day-fit/types';
import { ResultStatus } from './ResultStatus';

const today: TDayWeather = {
  dateISO: '2025-09-16',
  high: 75,
  low: 60,
  feelsLikeHigh: 74,
  summary: 'overcast',
};

const meta = {
  title: 'Components/ResultStatus',
  component: ResultStatus,
  args: {
    advice: null,
    confidence: 0.72,
    days: [today],
    loading: false,
    locationLabel: 'SoHo, New York City, United States',
    step: 3,
  },
};

export default meta;

export const Loading = {
  args: { loading: true, step: 1, days: null, advice: null, confidence: null },
};

export const Final = {};
