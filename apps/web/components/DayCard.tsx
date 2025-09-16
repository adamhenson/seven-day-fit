import { visualsForPresets } from '@/lib/outfit-display';
import type { TDayWeather, TOutfitPreset } from '@seven-day-fit/types';

/**
 * React component to display a day's forecast and outfit recommendation.
 */
export const DayCard = ({
  day,
  outfit,
  notes,
}: {
  /** Normalized daily weather values */
  day: TDayWeather;

  /** Outfit preset labels */
  outfit: TOutfitPreset[];

  /** Notes for the day */
  notes: string[];
}) => {
  const weekday = new Date(`${day.dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
  });
  const low = Math.round(day.low);
  const high = Math.round(day.high);
  const tempLine = `${low}° - ${high}°${day.summary ? ` ${day.summary}` : ''}`;
  const outfitLabels = visualsForPresets({ presets: outfit })
    .map((v) => v.label)
    .join(' + ');
  const notesInline = (notes || []).map((n) => n.toLowerCase().replace('spf', 'SPF')).join(', ');
  const recLine = notesInline ? `${outfitLabels}, ${notesInline}` : outfitLabels;

  return (
    <div className='rounded-lg border p-6 text-center'>
      <div className='mb-1 text-2xl font-semibold'>{weekday}</div>
      <div className='mb-3 text-base text-muted-foreground'>{tempLine}</div>
      <div className='mb-3 flex flex-wrap items-center justify-center gap-3 text-5xl'>
        {visualsForPresets({ presets: outfit }).map((v) => (
          <span key={v.label} aria-hidden='true'>
            {v.icon}
          </span>
        ))}
      </div>
      <div className='text-base font-semibold'>{recLine}</div>
    </div>
  );
};
