import { Page } from '@playwright/test';

export class OfficeLoginPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('https://www.office.com/login', { waitUntil: 'domcontentloaded' });
  }

  async signIn(email: string, password: string) {
    // Email screen
    await this.page.waitForSelector('input#i0116, input[name="loginfmt"]', { timeout: 30000 });
    const emailInput = this.page.locator('input#i0116, input[name="loginfmt"]');
    await emailInput.fill(email);

    // "Next"
    const nextBtn = this.page.locator('input#idSIButton9, button[type="submit"]');
    await nextBtn.first().click();

    // Password screen
    await this.page.waitForSelector('input#i0118', { timeout: 30000 });
    await this.page.locator('input#i0118').fill(password);

    // "Sign in"
    await this.page.locator('input#idSIButton9').click();

    // Optional: Stay signed in?
    const staySignedInYes = this.page.locator('input#idSIButton9'); // "Yes"
    const staySignedInNo = this.page.locator('input#idBtn_Back');   // "No"
    try {
      await staySignedInYes.waitFor({ state: 'visible', timeout: 15000 });
      if (await staySignedInNo.isVisible()) {
        await staySignedInNo.click();
      } else {
        await staySignedInYes.click();
      }
    } catch {
      // Dialog didn't appear — that's fine.
    }

    // Land on Office hub
    await this.page.waitForURL(/office\.com/i, { timeout: 30000 });
  }
}
