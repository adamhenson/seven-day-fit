'use client';

import { DayCard } from '@/components/DayCard';
import { ResultStatus } from '@/components/ResultStatus';
import { SearchBar } from '@/components/SearchBar';
import { Toast } from '@/components/Toast';
import { useSearch } from '@/lib/useSearch';
import { useCallback } from 'react';
import type { ReactElement } from 'react';

/**
 * React page component rendering the search UX and weekly results.
 */
export default function Home(): ReactElement {
  const {
    advice,
    confidence,
    days,
    loading,
    locationLabel,
    outfits,
    step,
    toast,
    setToast,
    runSearch,
  } = useSearch();

  const handleSearch = useCallback((input: string) => runSearch(input), [runSearch]);

  return (
    <main className='mx-auto flex min-h-screen max-w-7xl flex-col gap-8 p-6'>
      <div className='mx-auto mt-16 w-full max-w-xl text-center'>
        <h1 className='mb-2 text-3xl font-semibold'>Seven Day Fit</h1>
        <p className='text-sm text-muted-foreground'>
          Describe a location and we&#39;ll dress you for the week based on the weather.
        </p>
      </div>

      <SearchBar onSubmit={handleSearch} disabled={loading} />

      <ResultStatus
        advice={advice}
        confidence={confidence}
        days={days}
        loading={loading}
        locationLabel={locationLabel}
        step={step}
      />
      <Toast message={toast} onClose={() => setToast(null)} />

      {outfits && days && locationLabel ? (
        <h2 className='text-center text-xl text-muted-foreground'>{locationLabel}</h2>
      ) : null}

      {/* no-results notice handled by toast */}
      {outfits && days ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
          {outfits.map((d) => (
            <DayCard key={d.dateISO} day={d} outfit={d.outfit} notes={d.notes} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
