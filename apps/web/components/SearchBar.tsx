'use client';

/**
 * React component to render a search input and submit button.
 */
export const SearchBar = ({
  onSubmit,
  placeholder,
  disabled,
}: {
  /** Handler invoked with the free-text input when submitted */
  onSubmit: (value: string) => void;

  /** Optional placeholder text for the input */
  placeholder?: string;

  /** Disable input and submit interactions */
  disabled?: boolean;
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = String(formData.get('q') ?? '').trim();
    if (value) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className='mx-auto w-full max-w-xl' autoComplete='off'>
      <div className='relative'>
        <input
          id='search-input'
          name='q'
          placeholder={placeholder ?? '"the big apple", "Mission, SF", or a riddle...'}
          className={`w-full rounded-md border px-3 pr-12 py-2 outline-none ${
            disabled
              ? 'border-neutral-700 bg-background/60 text-neutral-400'
              : 'bg-background focus:border-foreground'
          }`}
          aria-label='Free-text location'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='none'
          spellCheck={false}
          type='search'
          inputMode='search'
          disabled={disabled}
          aria-disabled={disabled ? true : undefined}
        />

        <button
          type='submit'
          aria-label='Search'
          className={`absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-opacity focus:outline-none focus:ring-2 cursor-pointer ${
            disabled
              ? 'bg-neutral-700 text-neutral-400 opacity-70 cursor-not-allowed'
              : 'bg-foreground text-background hover:opacity-90 focus:ring-foreground/40'
          }`}
          disabled={disabled}
          aria-disabled={disabled ? true : undefined}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            className='h-4 w-4'
            aria-hidden='true'
          >
            <path d='M5 12h12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
            <path
              d='M13 5l7 7-7 7'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span className='sr-only'>Search</span>
        </button>
      </div>
    </form>
  );
};
