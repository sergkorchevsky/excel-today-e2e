import dotenv from 'dotenv';
dotenv.config();

export const config = {
  email: process.env.M365_EMAIL ?? '',
  password: process.env.M365_PASSWORD ?? '',
  timezoneId: process.env.TZ ?? 'Europe/Warsaw',
  locale: process.env.LOCALE ?? 'en-US'
};

if (!config.email || !config.password) {
  console.warn('[WARN] Missing M365_EMAIL or M365_PASSWORD in environment. Tests will fail to login.');
}

export default config;
