# Excel Online E2E — Validate `TODAY()` (Playwright + TypeScript)

This repo contains a Playwright end‑to‑end test that opens **Excel for the web (Excel Online)** in **Chrome**, inserts a formula that renders `TODAY()` as an ISO date, and verifies the value equals the test run date.

> ✅ Uses `.env` for credentials • ✅ Playwright Test runner • ✅ CI workflow • ✅ Video/trace demo

---

## How it works

1. Logs in at `office.com` using a Microsoft 365 account.
2. Launches **Excel Online** → **Blank workbook**.
3. In cell **A1**, types: `=TEXT(TODAY(),"yyyy-mm-dd")` and commits.
4. Reads the evaluated value from A1 and asserts it equals **today’s date** in the browser’s timezone.
   - Browser timezone is set in Playwright config (`timezoneId`) and defaults to `Europe/Warsaw`.

---

## Quick start

### 1) Prerequisites
- Node.js 18+ (tested on Node 20)
- A Microsoft 365 test account that can access Excel Online
  - Tip: disable 2FA for CI, or update the test to use a pre-authenticated storage state.
- Chrome installed (Playwright will use the `chrome` channel)

### 2) Install deps
```bash
npm ci
npx playwright install --with-deps
```

### 3) Configure secrets
Create `.env` from `.env.example` and fill in:
```
M365_EMAIL=your-msa-or-aad-user@example.com
M365_PASSWORD=yourStrongPasswordHere
# Optional, but recommended for stability:
TZ=Europe/Warsaw
LOCALE=en-US
```

### 4) Run the test
Headless:
```bash
npm test
```

Headed with video (demo mode):
```bash
npm run demo
```

The HTML report appears in `playwright-report/`. Videos & traces are stored under `test-results/`.

---

## Repo structure

```
.
├── .github/workflows/ci.yml           # GitHub Actions: runs the test, uploads report & videos
├── src/
│   ├── config.ts                      # Loads .env (email, password, TZ, LOCALE)
│   └── pages/
│       ├── OfficeLogin.ts             # Microsoft login flow
│       └── ExcelPage.ts               # Launch workbook, enter formula, read A1
├── tests/
│   └── today.spec.ts                  # The E2E test
├── playwright.config.ts               # Playwright config (Chrome, timezone, video, trace)
├── package.json, tsconfig.json, .env.example, .gitignore
└── README.md
```

---

## Known bottlenecks / limitations / workarounds

- **MFA / Conditional Access**: Automated login may be blocked by tenant policies or MFA challenges.
  - *Workaround A*: Run the test with a dedicated test account with MFA disabled, restricted to a safe test tenant.
  - *Workaround B*: Use Playwright **storageState** to pre-authenticate locally and commit the state (only for non-sensitive demos).

- **Time zone drift**: `TODAY()` uses the service/browser time zone for evaluation.
  - This project pins the browser **timezone** via Playwright to `Europe/Warsaw`. If your Microsoft 365 account uses a different time zone (e.g., Outlook settings), change `TZ` in `.env` and align your tenant’s time zone.

- **Localization**: Excel Online’s UI and date formats vary by locale.
  - We render `TODAY()` via `TEXT(...,"yyyy-mm-dd")` to avoid locale‑dependent formats and assert against an ISO string.
  - If your tenant’s formula language isn’t English, adjust the function names accordingly (rare for Excel Online).

- **UI churn / selectors**: Microsoft’s web UIs evolve frequently.
  - This test prefers resilient approaches (role/name selectors, IDs for login flow). The Excel grid is largely canvas‑based; we fall back to **clipboard read** to capture the evaluated value if no accessible text is exposed.

- **Clipboard permissions**: Some environments restrict `navigator.clipboard.readText()`.
  - The test first tries accessibility text; if clipboard fails in your environment, consider downloading the workbook and verifying with a Node XLSX parser instead.

- **Licensing**: The account must be licensed for Excel Online and allowed to create/edit a workbook.

---

## FAQ

**Q: How do I record a demo video?**  
A: Run `npm run demo` (headed) or set `PWVIDEO=1` for headless. Videos land in `test-results/<test-name>/` as `.webm`. You can upload these directly or convert to MP4 with ffmpeg:
```bash
ffmpeg -i test-results/**/video.webm -c copy demo.mp4
```

**Q: How do I run this in GitHub Actions?**  
A: Push to GitHub and add **Repository Secrets** `M365_EMAIL` and `M365_PASSWORD`. The provided workflow runs the test on every push and uploads the report and videos as artifacts.

**Q: Can I avoid typing passwords in tests?**  
A: Yes. Run an interactive login once and save the Playwright storage state, then reuse it:
```ts
// playwright.config.ts
// use: { storageState: 'auth-state.json' }
```
Create `auth-state.json` with a one-time script or `npx playwright codegen`.

**Q: What if TODAY() returns yesterday/tomorrow in CI?**  
A: That means a timezone mismatch (tenant vs browser). Align them by setting `TZ` in `.env` and updating your Microsoft account time zone (Outlook settings), or override `timezoneId` in `playwright.config.ts`.

**Q: Alternative solutions?**  
- Use **Office Scripts** or **Microsoft Graph** to set a cell formula and read its evaluated value via API — faster and less brittle than UI automation, but not strictly end‑to‑end.
- Use **Excel Desktop** with WinAppDriver / Playwright + WebView2 if your scope includes desktop apps.

---

## Contributing / Local tips

- Run headed (`npm run demo`) to debug selectors; open the **trace** in `playwright-report` for details.
- If Microsoft shows a “Pick an account” tile instead of the email screen, the login page object still proceeds to password after you click your account — or sign out before running the test to keep the flow stable.

---

## License

MIT
