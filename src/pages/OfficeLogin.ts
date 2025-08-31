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

    // Use your own password
    await this.page.waitForSelector('span.fui-Link', { timeout: 30000 });
    await this.page.locator('span.fui-Link').click();

    // Password screen
    await this.page.waitForSelector('#passwordEntry', {timeout: 30000 });
    await this.page.locator('#passwordEntry').fill(password);

    // "Sign in"
    await this.page.getByTestId('primaryButton').click();

    // Land on Office hub
    await this.page.waitForURL(/office\.com/i, { timeout: 30000 });
  }
}
