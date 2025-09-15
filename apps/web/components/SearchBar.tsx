'use client';

/**
 * React component to render a search input and submit button.
 */
export const SearchBar = ({
  onSubmit,
  placeholder,
}: {
  /** Handler invoked with the free-text input when submitted */
  onSubmit: (value: string) => void;

  /** Optional placeholder text for the input */
  placeholder?: string;
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = String(formData.get('q') ?? '').trim();
    if (value) onSubmit(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mx-auto flex w-full max-w-xl items-center gap-2'
      autoComplete='off'
    >
      <input
        name='q'
        placeholder={placeholder ?? '"the big apple", "Mission, SF", or a riddle...'}
        className='flex-1 rounded-md border bg-background px-3 py-2 outline-none focus:border-foreground'
        aria-label='Free-text location'
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='none'
        spellCheck={false}
      />
      <button type='submit' className='rounded-md bg-foreground px-4 py-2 text-background'>
        Search
      </button>
    </form>
  );
};
