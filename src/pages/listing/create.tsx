import { useUser } from "@clerk/nextjs";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import countryList from "react-select-country-list";
import PageLayout from "~/components/layout";
import LoadingSpinner from "~/components/loading";
import { api } from "~/utils/api";
import RangeSlider from "~/components/rangeSlider";

export default function CreateListing() {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(50);
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);
  const [country, setCountry] = useState("France");
  const [city, setCity] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isCreating } = api.listings.create.useMutation({
    onSuccess: () => {
      handleReset();
      void ctx.listings.getAll.invalidate();
      toast.success("Listing created");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      if (errorMessage) {
        Object.values(errorMessage).map((error) => {
          if (error && error[0]) {
            toast.error(error[0]);
          }
        });
      }
    },
  });

  if (!user) return null;

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setPrice(0);
    setBeds(0);
    setBaths(0);
    setCountry("");
  };

  const handleSubmit = () => {
    mutate({
      title,
      description,
      price,
      beds,
      baths,
      country,
      city,
    });
  };

  const options = countryList().getData();

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col gap-2 rounded-2xl border p-4 shadow-lg">
        <p className="text-lg font-semibold">Create a new listing</p>
        <p className="text-sm text-gray-400">
          Create a new listing to share with others
        </p>

        <div className="flex items-center gap-3">
          <Listbox value={country} onChange={setCountry}>
            <div className="relative w-full">
              <Listbox.Button className="relative w-full cursor-default rounded-md border bg-white py-2 pl-3 pr-10 text-left focus:outline-none">
                {country ? (
                  <span className="block truncate">{country}</span>
                ) : (
                  <span className="block truncate text-gray-500">
                    Select a country
                  </span>
                )}

                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((country, index) => (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-gray-100 text-black" : "text-gray-900"
                        }`
                      }
                      value={country.label}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {country.label}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
          <input
            type="text"
            placeholder="City"
            className="w-full rounded-md border p-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isCreating}
            autoComplete="address-level2"
          />
        </div>
        <input
          type="text"
          placeholder="Title"
          className="rounded-md border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
        />
        <textarea
          placeholder="Description"
          className="resize-none rounded-md border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreating}
        ></textarea>
        <div className="py-4">
          <h3 className="mb-4 w-full text-center text-3xl font-bold">
            {price}€<span className="text-xl font-normal"> /night</span>
          </h3>
          <RangeSlider
            className="h-6 w-full"
            max={500}
            step={10}
            value={price}
            onChange={setPrice}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex w-full items-center gap-3">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              className="h-6 w-6"
            >
              <path d="M26 4a2 2 0 0 1 1.995 1.85L28 6v7.839l1.846 5.537a3 3 0 0 1 .115.468l.03.24.009.24V30h-2v-2H4v2H2v-9.675a3 3 0 0 1 .087-.717l.067-.232L4 13.836V6a2 2 0 0 1 1.697-1.977l.154-.018L6 4zm2 18H4v4h24zm-1.388-6H5.387l-1.333 4h23.891zM26 6H6v8h2v-4a2 2 0 0 1 1.85-1.995L10 8h12a2 2 0 0 1 1.995 1.85L24 10v4h2zm-11 4h-5v4h5zm7 0h-5v4h5z"></path>
            </svg>
            <input
              type="number"
              placeholder="Beds"
              className="w-full rounded-md border p-2"
              value={beds}
              onChange={(e) => setBeds(parseInt(e.target.value))}
              disabled={isCreating}
            />
          </div>
          <div className="flex w-full items-center gap-3">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              className="h-6 w-6"
            >
              <path d="M7 1a3 3 0 0 0-2.995 2.824L4 4v27h2V4a1 1 0 0 1 .883-.993L7 3h11a1 1 0 0 1 .993.883L19 4v1h-5a1 1 0 0 0-.993.883L13 6v3h-3v2h19V9h-2V6a1 1 0 0 0-.883-.993L26 5h-5V4a3 3 0 0 0-2.824-2.995L18 1H7zm13 28a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM15 7h10v2H15V7z"></path>
            </svg>
            <input
              type="number"
              placeholder="Baths"
              className="w-full rounded-md border p-2"
              value={baths}
              onChange={(e) => setBaths(parseInt(e.target.value))}
              disabled={isCreating}
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-8 flex items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white"
          disabled={isCreating}
        >
          {isCreating ? (
            <div className="p-1">
              <LoadingSpinner color="white" />
            </div>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </PageLayout>
  );
}
