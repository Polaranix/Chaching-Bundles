/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: "functions/app",
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  serverDependenciesToBundle: [
    "@shopify/shopify-app-remix",
    "@shopify/shopify-app-session-storage-prisma",
    /^@shopify\/.*/,
  ],
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
