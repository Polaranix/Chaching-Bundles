import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { boundary } from '@shopify/shopify-app-remix/server'
import { AppProvider } from '@shopify/shopify-app-remix/react'
import polarisStyles from '@shopify/polaris/build/esm/styles.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: polarisStyles },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || '',
  })
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>()

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider isEmbeddedApp apiKey={apiKey}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

// Shopify embedded app specific error boundary
export function ErrorBoundary() {
  return boundary.error(useLoaderData<typeof loader>())
}
