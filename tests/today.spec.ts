import { test, expect } from '@playwright/test';
import config from '../src/config';
import { OfficeLoginPage } from '../src/pages/OfficeLogin';
import { ExcelPage } from '../src/pages/ExcelPage';

function expectedDateISO(timeZone: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = fmt.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

test.describe('Excel Online TODAY()', () => {
  test('returns today’s date (ISO yyyy-mm-dd via TEXT)', async ({ page, context }) => {
    test.skip(!config.email || !config.password, 'Missing M365_EMAIL or M365_PASSWORD in .env');

    // Align expected with browser time zone
    // @ts-ignore - internal access is okay in tests
    const tz = (context as any)._options?.timezoneId ?? config.timezoneId;
    const expected = expectedDateISO(tz);

    const login = new OfficeLoginPage(page);
    await login.gotoLogin();
    await login.signIn(config.email, config.password);

    const excel = new ExcelPage(page);
    const frame = await excel.openBlankWorkbook();
    await excel.enterTodayIsoAndCommit(frame);

    const value = await excel.readA1Value(frame);
    expect(value, 'Could not read value from A1; check video & trace').not.toBeNull();
    expect(value).toBe(expected);
  });
});
