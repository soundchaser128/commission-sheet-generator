import type {CommissionTier, CommissionSheet} from "~/helpers/types"
import * as htmlToImage from "html-to-image"
import Preview from "~/components/Preview"
import {useState} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faAdd, faEdit, faSave, faTrash} from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"
import useLocalStorage from "~/helpers/useLocalStorage"
import AddNewTierModal from "~/components/CommissionTierModal"
import styles from "~/styles/styles"
import FontsDropdown from "~/components/FontsDropdown"
import {useLoaderData} from "@remix-run/react"
import type {FontFamiliy} from "~/helpers/fonts.server"
import {fetchFonts} from "~/helpers/fonts.server"
import type {LoaderFunction} from "@remix-run/server-runtime"
import {json} from "@remix-run/server-runtime"
import {getNextId} from "~/helpers/utils"

const localStorageKey = "savedCommissionData"

const initialState: CommissionSheet = {
  template: "card",
  artistName: "",
  currency: "dollar",
  rules: ["Don't be a jerk", "Nothing illegal"],
  colors: {
    background: "sky",
    text: "sky",
  },
  tiers: [
    {
      name: "Basic",
      image: "/images/placeholder.jpg",
      info: ["One character", "Simple background"],
      price: 45,
      id: getNextId(),
    },
    {
      name: "Advanced",
      image: "/images/placeholder.jpg",
      info: ["One character", "More elaborate background"],
      price: 55,
      id: getNextId(),
    },
    {
      name: "Premium",
      image: "/images/placeholder.jpg",
      info: ["Two characters", "Custom ackground scene"],
      price: 65,
      id: getNextId(),
    },
  ],

  links: {
    twitter: "",
    website: "",
    discord: "",
  },
}

export const loader: LoaderFunction = async () => {
  const fonts = await fetchFonts()
  return json(fonts.items.slice(0, 100))
}

export default function Index() {
  const [data, setData] = useLocalStorage(localStorageKey, initialState)
  const [modalOpen, setModalOpen] = useState(false)
  const [newRule, setNewRule] = useState("")
  const [tierToEdit, setTierToEdit] = useState<CommissionTier | undefined>()

  const fonts = useLoaderData<FontFamiliy[]>()

  const createScreenshot = async () => {
    const previewElement = document.getElementById("preview-frame")!
    const dataUrl = await htmlToImage.toPng(previewElement)
    const link = document.createElement("a")
    link.download = "commission-sheet.png"
    link.href = dataUrl
    link.click()
    link.remove()
  }

  const onChange = (key: keyof CommissionSheet, value: any) => {
    const newState = {...data, [key]: value}
    setData(newState)
  }

  const onRemoveTier = (tier: CommissionTier) => {
    if (window.confirm("Are you sure you want to remove this tier?")) {
      const newState = {
        ...data,
        tiers: data.tiers.filter((t) => t.name !== tier.name),
      }
      setData(newState)
    }
  }

  const onRemoveRule = (rule: string) => {
    if (window.confirm("Are you sure you want to remove this rule?")) {
      const newState = {...data, rules: data.rules.filter((r) => r !== rule)}
      setData(newState)
    }
  }

  const onNewTierAdded = (tier: CommissionTier, type: "edit" | "new") => {
    if (type === "new") {
      const newState = {...data, tiers: [...data.tiers, tier]}
      setData(newState)
    } else {
      const newState = {
        ...data,
        tiers: data.tiers.map((t) => (t.id === tier.id ? tier : t)),
      }
      setData(newState)
    }
  }

  const onLinkChange = (
    linkType: keyof CommissionSheet["links"],
    value: string
  ) => {
    setData({...data, links: {...data.links, [linkType]: value}})
  }

  return (
    <main className="relative flex min-h-screen bg-white">
      <section className="z-10 flex flex-col bg-indigo-50 p-4 shadow-xl">
        <header className="-mt-4 rounded-b-lg bg-indigo-100 bg-opacity-50 p-3 shadow-lg">
          <h1 className="text-center text-3xl font-bold">Mitzi</h1>
          <p className="">Generates nice looking commission sheets for you.</p>
          <p className="">
            Built by{" "}
            <a
              className="underline transition text-indigo-400 hover:text-indigo-500"
              href="https://soundchaser128.xyz"
              tabIndex={-1}
            >
              soundchaser128.
            </a>
          </p>
        </header>

        {modalOpen && (
          <AddNewTierModal
            openModal={() => setModalOpen(true)}
            closeModal={() => setModalOpen(false)}
            isOpen={modalOpen}
            handleSubmit={onNewTierAdded}
            tierToEdit={tierToEdit}
          />
        )}

        <form className="mt-4 flex flex-col gap-4">
          <div className={styles.field}>
            <h2 className="text-xl font-bold">Select currency</h2>
            <div className="flex gap-4">
              <div>
                <input
                  className="mr-2"
                  type="radio"
                  id="dollar-radio"
                  name="currency"
                  value="dollar"
                  checked={data.currency === "dollar"}
                  onChange={(e) => onChange("currency", e.target.value)}
                />
                <label htmlFor="dollar-radio">US Dollar ($)</label>
              </div>
              <div>
                <input
                  className="mr-2"
                  id="euro-radio"
                  type="radio"
                  name="currency"
                  value="euro"
                  checked={data.currency === "euro"}
                  onChange={(e) => onChange("currency", e.target.value)}
                />
                <label htmlFor="euro-radio">Euro (€)</label>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <h2 className="mb-3 text-xl font-bold">Your name</h2>
            <input
              placeholder="Enter your name"
              type="text"
              className={styles.input}
              value={data.artistName}
              onChange={(e) => onChange("artistName", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <h2 className="text-xl font-bold">Commission tiers</h2>
            <div className="flex flex-col">
              {data.tiers.map((tier) => (
                <div
                  className="flex grow justify-between leading-loose"
                  key={tier.id}
                >
                  {tier.name}

                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      className="font-sm text-gray-700 hover:text-gray-800"
                      title="Edit tier"
                      onClick={() => {
                        setTierToEdit(tier)
                        setModalOpen(true)
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      type="button"
                      title="Remove tier"
                      className="font-sm text-rose-500 hover:text-rose-600"
                      onClick={() => onRemoveTier(tier)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={clsx(
                styles.button.base,
                styles.button.green,
                "self-end"
              )}
              onClick={() => setModalOpen(true)}
            >
              <FontAwesomeIcon icon={faAdd} /> Add tier
            </button>
          </div>

          <div className={styles.field}>
            <h2 className="text-xl font-bold">Rules</h2>
            {data.rules.map((rule) => (
              <p className="flex justify-between" key={rule}>
                <span className="w-80 overflow-hidden overflow-ellipsis whitespace-nowrap leading-loose">
                  {rule}
                </span>

                <button
                  type="button"
                  className="font-sm text-rose-500 hover:text-rose-600"
                  onClick={() => onRemoveRule(rule)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </p>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                className={styles.input}
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="New rule"
              />
              <button
                type="button"
                className={clsx(styles.button.base, styles.button.green)}
                onClick={() => {
                  setNewRule("")
                  setData({...data, rules: [...data.rules, newRule]})
                }}
              >
                <FontAwesomeIcon icon={faAdd} /> Add rule
              </button>
            </div>
          </div>

          <div className={clsx(styles.field, "gap-2")}>
            <h2 className="text-xl font-bold">Socials</h2>
            <div className="flex items-baseline gap-2">
              <label className={clsx(styles.label, "w-20")}>Twitter</label>
              <input
                type="text"
                className={styles.input}
                value={data.links.twitter || ""}
                onChange={(e) => onLinkChange("twitter", e.target.value)}
                placeholder="Twitter handle"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <label className={clsx(styles.label, "w-20")}>Discord</label>
              <input
                type="text"
                className={styles.input}
                value={data.links.discord || ""}
                onChange={(e) => onLinkChange("discord", e.target.value)}
                placeholder="Discord server or username"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <label className={clsx(styles.label, "w-20")}>Website</label>
              <input
                type="text"
                className={styles.input}
                value={data.links.website || ""}
                onChange={(e) => onLinkChange("website", e.target.value)}
                placeholder="Website URL"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <label className={clsx(styles.label, "w-20")}>Instagram</label>
              <input
                type="text"
                className={styles.input}
                value={data.links.instagram || ""}
                onChange={(e) => onLinkChange("instagram", e.target.value)}
                placeholder="Instagram username"
              />
            </div>
          </div>

          <div className={styles.field}>
            <h2 className="mb-2 text-xl font-bold">Select font</h2>
            <FontsDropdown
              fonts={fonts}
              onChange={(font) => onChange("font", font)}
            />
          </div>
        </form>

        <button
          id="download-button"
          onClick={createScreenshot}
          className={clsx(styles.button.base, styles.button.green, "mx-2 mt-4")}
        >
          <FontAwesomeIcon icon={faSave} /> Save As Image
        </button>
      </section>

      <section className="grow bg-white">
        <Preview {...data} />
      </section>
    </main>
  )
}
