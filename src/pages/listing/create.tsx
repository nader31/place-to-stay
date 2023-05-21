import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import PageLayout from "~/components/layout";
import LoadingSpinner from "~/components/loading";
import { api } from "~/utils/api";

export default function CreateListing() {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);

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
  };

  const handleSubmit = () => {
    mutate({
      title,
      description,
      price,
      beds,
      baths,
    });
  };

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col gap-2 rounded-md border p-4">
        <p className="text-lg font-semibold">Create a new listing</p>
        <p className="text-sm text-gray-400">
          Create a new listing to share with others
        </p>
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
        <input
          type="number"
          placeholder="Price"
          className="rounded-md border p-2"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          disabled={isCreating}
        />
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
          className="flex items-center justify-center rounded-lg bg-black px-4 py-2 font-medium text-white"
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