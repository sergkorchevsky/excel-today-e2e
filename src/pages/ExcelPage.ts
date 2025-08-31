import { Page, Frame } from '@playwright/test';

export class ExcelPage {
  constructor(private page: Page) {}

  async openBlankWorkbook(): Promise<Frame> {
    await this.page.goto('https://www.office.com/launch/excel?auth=2', { waitUntil: 'networkidle' });

    // Clicking "Blank workbook" opens a new tab/window
    const [workbookPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.getByRole('link', { name: /blank workbook/i }).first().click().catch(async () => {
        await this.page.getByRole('button', { name: /new blank workbook/i }).click();
      })
    ]);

    await workbookPage.waitForLoadState('domcontentloaded');
    // Wait for the inner Excel frame
    await workbookPage.waitForSelector('iframe[name="WacFrame"], iframe[src*="excel.officeapps"]', { timeout: 60000 });

    const frame =
      workbookPage.frame({ name: 'WacFrame' }) ??
      workbookPage.frames().find(f => /excel\.officeapps/i.test(f.url()))!;

    // Wait for UI bits inside Excel
    await frame.waitForSelector('[aria-label*="Formula"], [role="textbox"]', { timeout: 60000 }).catch(() => {});
    return frame;
  }

  async enterTodayIsoAndCommit(frame: Frame) {
    // Focus grid & jump to A1
    await frame.click('body', { position: { x: 10, y: 10 } }).catch(() => {});
    await frame.press('body', 'Control+Home').catch(() => {});

    // Enter ISO-stable formula
    await frame.type('body', '=TEXT(TODAY(),"yyyy-mm-dd")', { delay: 20 });
    await frame.press('body', 'Enter');
  }

  async readA1Value(frame: Frame): Promise<string | null> {
    // Attempt 1: accessible label for A1 often includes the displayed value
    const a1 = frame.locator('[aria-label*="A1"]');
    try {
      if (await a1.count().then(c => c > 0)) {
        const text = await a1.first().innerText({ timeout: 5000 });
        const m = text.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
      }
    } catch {}

    // Attempt 2: copy evaluated cell to clipboard
    try {
      await frame.press('body', 'Control+Home');
      await frame.press('body', 'Control+C');
      const clip = await frame.evaluate(async () => {
        try { return await navigator.clipboard.readText(); } catch { return null; }
      });
      if (clip) {
        const m = clip.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
      }
    } catch {}

    return null;
  }
}
