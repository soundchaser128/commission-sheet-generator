import type {ActionArgs, LoaderArgs} from "@remix-run/node"
import {Form, useActionData, useTransition} from "@remix-run/react"
import {json, redirect} from "@remix-run/node"
import {supabase} from "~/service/supabase.server"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEnvelope} from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"

export const loader = async ({request}: LoaderArgs) => {
  return json({})
}

export const action = async ({request}: ActionArgs) => {
  const form = await request.formData()
  const email = form?.get("email")

  if (!email) {
    return json({error: {message: "Email is required"}}, 400)
  }

  if (typeof email !== "string") {
    return json({error: {message: "Email must be a string"}}, 400)
  }
  const url = new URL(request.url)
  const {error} = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${url.origin}/auth/login/callback`,
    },
  })

  if (error) {
    return json({error: {message: error.message}})
  }

  throw redirect("/auth/login/check-your-emails")
}

export default function Screen() {
  // FIXME
  const transition = useTransition()
  const actionData = useActionData<typeof action>()

  return (
    <section className="hero max-w-md bg-base-200 text-base-content">
      <div className="hero-content w-full flex-col items-start">
        <h1 className="text-2xl font-bold">Login</h1>
        {actionData?.error && (
          <div className="alert alert-error max-w-md shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error: Failed to reach login API.</span>
            </div>
          </div>
        )}
        <p className="">
          Sign up or log in using just your email, you will receive a link in
          your inbox that you can use to log in.
        </p>
        <Form method="post" className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-row items-center gap-2">
            <label className="label font-semibold" htmlFor="email">
              Email
            </label>
            <input
              className="input-primary input grow"
              type="email"
              name="email"
              id="email"
            />
          </div>
          <button
            className={clsx(
              "btn-success btn",
              transition.submission && "btn-disabled"
            )}
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            {transition.submission
              ? "Sending you a magic link"
              : "Send Magic Link"}
          </button>
        </Form>
      </div>
    </section>
  )
}
