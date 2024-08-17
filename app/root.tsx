import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"

import tailwindStylesheetUrl from "./styles/tailwind.css"
import reactCropStyles from "react-image-crop/dist/ReactCrop.css"
import iconStyles from "@fortawesome/fontawesome-svg-core/styles.css"
import {config} from "@fortawesome/fontawesome-svg-core"
import ThemeToggle from "./components/ThemeToggle"
import type {User} from "@supabase/supabase-js"
import {supabase} from "./service/supabase.server"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCat} from "@fortawesome/free-solid-svg-icons"

config.autoAddCss = false /* eslint-disable import/first */

export interface OutletContext {
  user?: User
}

export const links: LinksFunction = () => {
  return [
    {rel: "stylesheet", href: tailwindStylesheetUrl},
    {rel: "stylesheet", href: reactCropStyles},
    {rel: "stylesheet", href: iconStyles},
  ]
}

export let headers: HeadersFunction = () => {
  return {"Cache-Control": "s-max-age=1, stale-while-revalidate=31540000"}
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Mitzi",
  viewport: "width=device-width,initial-scale=1",
})

type Data = {
  env: Record<string, string>
  user?: User
}

export const loader: LoaderFunction = async ({request}) => {
  // const session = await authenticator.isAuthenticated(request)
  // const user = await supabase.auth.getUser(session?.access_token)

  return {
    // user: user?.data?.user,
    env: {
      PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    },
  }
}

export default function App() {
  const {env, user} = useLoaderData<Data>()

  return (
    <html lang="en" data-theme="light">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col">
          <nav className="flex justify-between bg-base-200 p-2 text-lg">
            <Link to="/" className="font-bold">
              <FontAwesomeIcon icon={faCat} className="mr-2" />
              Mitzi
            </Link>

            {user ? (
              <span>
                Logged in as <strong>{user.email}</strong>
              </span>
            ) : (
              <NavLink className="link" to="/auth/login">
                Log in
              </NavLink>
            )}
          </nav>

          <Outlet context={{user}} />
        </div>
        <ThemeToggle />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
      </body>
    </html>
  )
}
