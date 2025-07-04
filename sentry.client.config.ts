// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Temporarily disabled Sentry to avoid 403 errors
// Sentry.init({
//   dsn: "https://e300b41df2ffb6d4592972400a25c0d3@o4506876178464768.ingest.us.sentry.io/4507159179034624",
//   tracesSampleRate: 1,
//   debug: false,
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0.1,
//   integrations: [
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],
// });
