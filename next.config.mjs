// Load dotenv at the top
import dotenv from 'dotenv';
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    DWOLLA_ENV: process.env.DWOLLA_ENV,
    DWOLLA_KEY: process.env.DWOLLA_KEY,
    DWOLLA_SECRET: process.env.DWOLLA_SECRET,
    DWOLLA_BASE_URL: process.env.DWOLLA_BASE_URL,
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
    PLAID_SECRET: process.env.PLAID_SECRET,
    PLAID_ENV: process.env.PLAID_ENV,
    PLAID_PRODUCTS: process.env.PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: process.env.PLAID_COUNTRY_CODES,
    APPWRITE_SECRET: process.env.APPWRITE_SECRET,
  }
};

// Temporarily export without Sentry to avoid 403 errors
export default nextConfig;

// Original Sentry config (commented out):
// import {withSentryConfig} from '@sentry/nextjs';
// export default withSentryConfig(nextConfig, {
//   silent: true,
//   org: "jsm-x9",
//   project: "javascript-nextjs",
// }, {
//   widenClientFileUpload: true,
//   transpileClientSDK: true,
//   hideSourceMaps: true,
//   disableLogger: true,
//   automaticVercelMonitors: true,
// });