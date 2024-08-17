import {useEffect} from "react"
import type {ActionArgs} from "@remix-run/node"
import {useFetcher} from "@remix-run/react"
// import {authenticator} from "~/service/auth.server"
import {supabase} from "~/service/supabase.client"

export const action = async ({request}: ActionArgs) => {
  // await authenticator.authenticate("sb-magic-link", request, {
  //   successRedirect: "/",
  //   failureRedirect: "/auth/login",
  // })
}

export default function LoginCallback() {
  const fetcher = useFetcher()

  useEffect(() => {
    const {data: authListener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          const formData = new FormData()
          formData.append("session", JSON.stringify(session))

          fetcher.submit(formData, {method: "post"})
        }
      }
    )

    return () => authListener.subscription.unsubscribe()
  }, [fetcher])

  return null
}
