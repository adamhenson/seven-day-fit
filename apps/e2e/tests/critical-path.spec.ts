import { expect, test } from '@playwright/test';

test('critical path: search → resolve → forecast → outfits', async ({ page }) => {
  // Protection bypass handled via extraHTTPHeaders in Playwright config when token present
  await page.route('**/api/resolve-location', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        location: {
          displayName: 'Soho, London, UK',
          lat: 51.514,
          lon: -0.132,
          country: 'United Kingdom',
          confidence: 0.82,
        },
        accepted: true,
        candidate: { displayName: 'Soho, London, UK', lat: 51.514, lon: -0.132, confidence: 0.82 },
        advice: null,
      }),
    });
  });

  await page.route('**/api/forecast', async (route) => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return {
        dateISO: iso,
        high: 70 + i,
        low: 55 + i,
        feelsLikeHigh: 70 + i,
        uvIndex: 3,
        wind: 8,
        maxGust: 14,
        pop: 0.1,
        precipType: 'none',
        summary: 'Clear',
      };
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ days }),
    });
  });

  await page.goto('/');

  await expect(page.getByText('Seven Day Fit')).toBeVisible();

  const input = page.getByRole('searchbox', { name: /free-text location/i });
  await input.fill('Soho');
  await input.press('Enter');

  // Wait for final status banner with confidence
  await expect(page.getByText(/Confidence\s*82%/i)).toBeVisible();

  // Validate the location label and 7 cards rendered
  await expect(page.getByRole('heading', { level: 2, name: /Soho, London, UK/i })).toBeVisible();
  await expect(page.getByText(/Clear/).first()).toBeVisible();
});
