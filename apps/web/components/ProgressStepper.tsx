/**
 * React component to show simple step progress.
 */
export const ProgressStepper = ({
  step,
}: {
  /** Current step index (0..3) */
  step: 0 | 1 | 2 | 3;
}) => {
  const labels = [
    'Decoding your clue…',
    'Pinning the spot…',
    'Fetching forecast…',
    'Curating outfits…',
  ];
  return (
    <div className='mx-auto mt-6 w-full max-w-xl'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        {labels.map((label, idx) => (
          <div key={label} className='flex flex-col items-center gap-1'>
            <div className={`h-2 w-2 rounded-full ${idx <= step ? 'bg-foreground' : 'bg-muted'}`} />
            <div className='hidden text-[11px] sm:block'>{label}</div>
          </div>
        ))}
      </div>
      <div className='mt-2 h-1 w-full rounded bg-muted'>
        <div
          className='h-1 rounded bg-foreground'
          style={{ width: `${((step + 1) / labels.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
