import React from "react"
import {Combobox, Transition} from "@headlessui/react"
import {useState} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faAngleDown, faCheck} from "@fortawesome/free-solid-svg-icons"

interface DropdownValue {
  text: string
  value: string
  className?: string
}

interface Props {
  placeholder: string
  values: DropdownValue[]
  onChange: (value: DropdownValue) => void
  id?: string
}

const Dropdown: React.FC<Props> = ({values, onChange, id, placeholder}) => {
  const [selected, setSelected] = useState<DropdownValue | null>(null)
  const [query, setQuery] = useState("")

  const filteredValues =
    query === ""
      ? values
      : values.filter((v) =>
          v.text
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        )

  const handleChange = (value: DropdownValue) => {
    setSelected(value)
    onChange(value)
  }

  return (
    <Combobox value={selected} onChange={handleChange}>
      <div id={id} className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-300 sm:text-sm">
          <Combobox.Input
            className="w-full rounded-lg border border-primary bg-base-100 py-2 pl-4 pr-10 text-sm leading-5 text-base-content focus:ring-0"
            displayValue={(value: DropdownValue | null) =>
              value?.text || placeholder
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon
              icon={faAngleDown}
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredValues.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-base-100">
                Nothing found.
              </div>
            ) : (
              filteredValues.map((value) => (
                <Combobox.Option
                  key={value.value}
                  className={({active}) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-primary text-white" : "text-base-content"
                    } ${value.className || ""}`
                  }
                  value={value}
                >
                  {({selected, active}) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {value.text}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-sky-600"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}

export default Dropdown
