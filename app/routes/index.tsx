import {faTwitter} from "@fortawesome/free-brands-svg-icons"
import {faPaintBrush} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {Link} from "@remix-run/react"
import type {MetaFunction} from "@remix-run/server-runtime"

export const meta: MetaFunction = () => {
  return {
    title: "Mitzi",
  }
}

export default () => (
  <main className="flex h-screen w-full justify-center">
    <section className="hero max-w-3xl">
      <div className="hero-content flex-col bg-base-200 lg:flex-row">
        <img
          src="/android-chrome-192x192.png"
          alt="A smug cat"
          className="max-w-sm rounded-lg"
        />
        <div className="flex flex-col gap-4 ">
          <h1 className="text-3xl font-bold">Mitzi</h1>
          <p>
            Mitzi can generate commission sheets and Twitter banners for you,
            right inside your browser.
          </p>
          <div className="flex w-full gap-2">
            <Link
              className="btn-primary btn flex-auto"
              to="/create/commission-sheet"
            >
              <FontAwesomeIcon icon={faPaintBrush} className="mr-1" />
              Commission sheet generator
            </Link>
            <Link className="btn-primary btn flex-auto" to="/create/banner">
              <FontAwesomeIcon icon={faTwitter} className="mr-1" />
              Banner generator
            </Link>
          </div>

          <footer className="text-sm text-gray-500">
            Made by soundchaser128, this project is open source and available on{" "}
            <a className="link" href="https://github.com/soundchaser128/mitzi">
              Github.
            </a>
          </footer>
        </div>
      </div>
    </section>
  </main>
)
