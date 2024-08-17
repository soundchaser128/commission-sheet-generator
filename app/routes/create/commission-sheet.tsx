import type {CommissionTier, CommissionSheet} from "~/helpers/types"
import Preview from "~/components/Preview"
import {useState} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
  faAdd,
  faCloudUpload,
  faEdit,
  faSave,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"
import useLocalStorage from "~/hooks/useLocalStorage"
import AddNewTierModal from "~/components/CommissionTierModal"
import styles from "~/styles/styles"
import Dropdown from "~/components/Dropdown"
import {useLoaderData, useOutletContext, useFetcher} from "@remix-run/react"
import type {FontFamily} from "~/helpers/fonts.server"
import {fetchFonts} from "~/helpers/fonts.server"
import type {ActionFunction, LoaderFunction} from "@remix-run/server-runtime"
import {json} from "@remix-run/server-runtime"
import {getNextId} from "~/helpers/utils"
import useRenderContent from "~/hooks/useRenderContent"
import {Label} from "./banner"
import type {Color} from "~/helpers/colors"
import {BackgroundColors} from "~/helpers/colors"
import type {OutletContext} from "~/root"
import {createCommissionSheet} from "~/service/supabase.server"

const localStorageKey = "savedCommissionData"

const initialState: CommissionSheet = {
  template: "card",
  artistName: "Your name",
  currency: "dollar",
  rules: ["Don't be a jerk", "Nothing illegal"],
  colors: {
    background: "slate",
    text: "green",
  },
  tiers: [
    {
      name: "Basic",
      image: null,
      info: ["One character", "Simple background"],
      price: 45,
      id: getNextId(),
    },
    {
      name: "Advanced",
      image: null,
      info: ["One character", "More elaborate background"],
      price: 55,
      id: getNextId(),
    },
    {
      name: "Premium",
      image: null,
      info: ["Two characters", "Custom background scene"],
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
  try {
    const fonts = await fetchFonts()
    return json(fonts.items.slice(0, 100))
  } catch (e) {
    console.error(e)
    return json([])
  }
}

export const action: ActionFunction = async ({request}) => {
  const form = await request.formData()
  const string = form.get("body") as string
  const userId = form.get("userId") as string
  const body = JSON.parse(string) as CommissionSheet
  await createCommissionSheet(userId, body)

  return null
}

export const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms))

export default function Index() {
  const fetcher = useFetcher()
  const {user} = useOutletContext<OutletContext>()
  const [data, setData] = useLocalStorage(localStorageKey, initialState)
  const [modalOpen, setModalOpen] = useState(false)
  const [newRule, setNewRule] = useState("")
  const [tierToEdit, setTierToEdit] = useState<CommissionTier | undefined>()
  const {rendering, createScreenshot} = useRenderContent({
    containerId: "preview-frame",
    fileName: `commission-sheet-${data.artistName}.png`,
    width: 1280,
    height: 800,
  })
  const fonts = useLoaderData<FontFamily[]>()
  const fontDropdownValues = fonts.map((font) => ({
    text: font.family,
    value: font.family,
  }))

  const onChange = (key: keyof CommissionSheet, value: any) => {
    const newState = {...data, [key]: value}
    setData(newState)
  }

  const setBackgroundColor = (color: string) => {
    const colorValue = color as Color
    setData({...data, colors: {background: colorValue, text: data.colors.text}})
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

  const onResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all the data to the initial state?"
      )
    ) {
      setData(initialState)
    }
  }

  const onPublish = (event: React.FormEvent) => {
    event.preventDefault()
    if (user) {
      const form = new FormData()
      form.append("userId", user.id)
      form.append("body", JSON.stringify(data))
      fetcher.submit(form, {method: "post"})
    }
  }

  return (
    <main className="relative flex min-h-screen bg-white">
      <section className="max-screen z-10 flex flex-col overflow-y-scroll bg-base-200 p-2 shadow-xl">
        {modalOpen && (
          <AddNewTierModal
            openModal={() => setModalOpen(true)}
            closeModal={() => setModalOpen(false)}
            isOpen={modalOpen}
            handleSubmit={onNewTierAdded}
            tierToEdit={tierToEdit}
          />
        )}

        <form
          onSubmit={onPublish}
          method="post"
          className="flex flex-col gap-4"
        >
          <div className={styles.field}>
            <h2 className={styles.formHeader}>Select currency</h2>
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
                <Label htmlFor="dollar-radio">US Dollar ($)</Label>
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
                <Label htmlFor="euro-radio">Euro (€)</Label>
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
            <h2 className={styles.formHeader}>Commission tiers</h2>
            <div className="flex flex-col text-sm">
              {data.tiers.map((tier) => (
                <div
                  className="flex grow justify-between leading-loose"
                  key={tier.id}
                >
                  {tier.name || "<no name>"}

                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      className="text-base-content"
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
                      className="text-rose-500 hover:text-rose-600"
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
              className="btn-primary btn-sm btn self-end"
              onClick={() => setModalOpen(true)}
            >
              <FontAwesomeIcon className="mr-2" icon={faAdd} /> Add tier
            </button>
          </div>

          <div className={styles.field}>
            <h2 className={styles.formHeader}>Rules</h2>
            {data.rules.map((rule) => (
              <p className="flex justify-between text-sm" key={rule}>
                <span className="w-80 overflow-hidden overflow-ellipsis whitespace-nowrap leading-loose">
                  {rule}
                </span>

                <button
                  type="button"
                  className="font-sm text-rose-500 hover:text-rose-600"
                  onClick={() => onRemoveRule(rule)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="sr-only">Delete</span>
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
                className="btn-primary btn-sm btn"
                onClick={() => {
                  setNewRule("")
                  setData({...data, rules: [...data.rules, newRule]})
                }}
              >
                <FontAwesomeIcon className="mr-2" icon={faAdd} /> Add rule
              </button>
            </div>
          </div>

          <div className={clsx(styles.field, "gap-2")}>
            <h2 className={styles.formHeader}>Socials</h2>
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
            <Dropdown
              placeholder="Choose a font"
              values={fontDropdownValues}
              onChange={(font) =>
                onChange(
                  "font",
                  fonts.find((f) => f.family === font.value)
                )
              }
            />
          </div>

          <div className={styles.field}>
            <h2 className="text-xl font-bold">Select background color</h2>
            <Dropdown
              placeholder="Select color"
              values={Object.entries(BackgroundColors).map(
                ([name, className]) => ({
                  text: name,
                  value: name,
                })
              )}
              onChange={(color) => setBackgroundColor(color.value)}
            />
          </div>

          <div className="btn-group mt-4 gap-2">
            <button
              id="download-button"
              onClick={createScreenshot}
              className="btn-success btn flex-auto"
              disabled={rendering}
              type="button"
            >
              {rendering && (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 animate-spin"
                  />{" "}
                  Rendering...
                </>
              )}
              {!rendering && (
                <>
                  <FontAwesomeIcon className="mr-2" icon={faSave} /> Save As
                  Image
                </>
              )}
            </button>
            <button
              id="publish-button"
              className={clsx(
                "btn-success btn flex-auto",
                !user && "btn-disabled"
              )}
              type="submit"
            >
              <FontAwesomeIcon icon={faCloudUpload} className="mr-2" /> Publish
            </button>
          </div>
        </form>

        <button
          id="reset-button"
          onClick={onResetData}
          className="btn-error btn mx-2 mt-2 w-auto self-end"
        >
          <FontAwesomeIcon className="mr-2" icon={faTrash} /> Reset
        </button>
      </section>

      <section className="grow bg-gray-400">
        <Preview {...data} />
      </section>
    </main>
  )
}
