import type { NextPage } from "next";
import Head from "next/head";
import { SignInButton, UserButton, useClerk, useUser } from "@clerk/nextjs";

import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import toast from "react-hot-toast";

const CreateListing = () => {
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
        className="flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 font-medium text-white"
        disabled={isCreating}
      >
        {isCreating ? (
          <div className="p-1">
            <LoadingSpinner color="secondary" />
          </div>
        ) : (
          "Create"
        )}
      </button>
    </div>
  );
};

type ListingWithUser = RouterOutputs["listings"]["getAll"][number];
const ListingView = (props: ListingWithUser) => {
  const { listing, author } = props;
  return (
    <div key={listing.id} className="overflow-hidden">
      {listing.images && listing.images.length > 0 && listing.images[0] ? (
        <Image
          src={listing.images[0].url}
          alt="Listing image"
          className="h-72 w-full rounded-3xl object-cover"
          width={300}
          height={288}
        />
      ) : (
        <div className="h-72 w-full rounded-3xl bg-gray-100"></div>
      )}
      <div className="py-2">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
          {listing.title}
        </p>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-400">
          {listing.description}
        </p>
        <p className="mt-2">
          <span className="font-bold">${listing.price}</span> night
        </p>
        {author && (
          <div className="mt-2 flex items-center gap-2">
            <Image
              src={author?.profileImageURL}
              className="h-5 w-5 rounded-full"
              alt="Profile image"
              width={20}
              height={20}
            />
            <p className="text-xs">{author?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Listings = () => {
  const { data, isLoading: listingsLoading } = api.listings.getAll.useQuery();

  if (listingsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {data.map((fullListing) => (
        <ListingView {...fullListing} key={fullListing.listing.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  api.listings.getAll.useQuery();

  const { signOut } = useClerk();

  if (!userLoaded) return <div></div>;

  return (
    <>
      <Head>
        <title>Place To Stay</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Popover className="relative bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-6 md:justify-start md:space-x-10 xl:px-0">
          <div>
            <a href="#" className="flex py-2">
              <span className="sr-only">Workflow</span>
              <svg
                className="h-7 w-7"
                viewBox="0 0 108 108"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.8496 28.8414L27.864 10.827C28.4904 10.2006 29.1384 9.5958 29.8026 9.018C36.5202 3.186 45.0144 0 54 0C62.9856 0 71.4798 3.186 78.1974 9.018C78.8616 9.5904 79.5096 10.1952 80.136 10.827L98.1504 28.8414C104.458 35.1486 108 43.7022 108 52.623V64.206V81.9396C108 96.3306 96.3306 108 81.9342 108H54H26.0658C11.6694 108 -2.80142e-06 96.3306 -2.80142e-06 81.9342V64.206V52.623C-2.80142e-06 43.7022 3.5424 35.1486 9.8496 28.8414ZM18.0414 81.9342C18.0414 86.3676 21.6324 89.9586 26.0658 89.9586H38.5722V73.9368C38.5722 65.4156 45.4788 58.509 54 58.509C62.5212 58.509 69.4278 65.4156 69.4278 73.9368V89.9586H81.9342C86.3676 89.9586 89.9586 86.3676 89.9586 81.9342V56.3598C89.9586 49.8258 87.3612 43.5618 82.7442 38.9448L67.3758 23.5764C63.801 20.007 59.049 18.036 53.9946 18.036C48.9402 18.036 44.1882 20.007 40.6134 23.5764L25.245 38.9448C20.628 43.5618 18.0306 49.8258 18.0306 56.3598V81.9342H18.0414Z"
                  fill="black"
                />
              </svg>
            </a>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-black hover:bg-gray-100 focus:outline-none">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <Popover.Group as="nav" className="flex space-x-10">
              <a
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Cabins & Cottages
              </a>
              <a
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Entire Homes
              </a>
              <a
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Unique Stays
              </a>
            </Popover.Group>
            <div className="flex items-center md:ml-12">
              {!isSignedIn && (
                <SignInButton mode="redirect">
                  <button className="ml-8 inline-flex items-center justify-center rounded-full border border-transparent bg-black px-4 py-1 font-medium text-white shadow-sm">
                    Sign in
                  </button>
                </SignInButton>
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </div>
        </div>

        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden"
          >
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 108 108"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.8496 28.8414L27.864 10.827C28.4904 10.2006 29.1384 9.5958 29.8026 9.018C36.5202 3.186 45.0144 0 54 0C62.9856 0 71.4798 3.186 78.1974 9.018C78.8616 9.5904 79.5096 10.1952 80.136 10.827L98.1504 28.8414C104.458 35.1486 108 43.7022 108 52.623V64.206V81.9396C108 96.3306 96.3306 108 81.9342 108H54H26.0658C11.6694 108 -2.80142e-06 96.3306 -2.80142e-06 81.9342V64.206V52.623C-2.80142e-06 43.7022 3.5424 35.1486 9.8496 28.8414ZM18.0414 81.9342C18.0414 86.3676 21.6324 89.9586 26.0658 89.9586H38.5722V73.9368C38.5722 65.4156 45.4788 58.509 54 58.509C62.5212 58.509 69.4278 65.4156 69.4278 73.9368V89.9586H81.9342C86.3676 89.9586 89.9586 86.3676 89.9586 81.9342V56.3598C89.9586 49.8258 87.3612 43.5618 82.7442 38.9448L67.3758 23.5764C63.801 20.007 59.049 18.036 53.9946 18.036C48.9402 18.036 44.1882 20.007 40.6134 23.5764L25.245 38.9448C20.628 43.5618 18.0306 49.8258 18.0306 56.3598V81.9342H18.0414Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                  <div className="-mr-2">
                    <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
              </div>
              {isSignedIn && (
                <div className="flex items-center gap-4 px-5 py-6">
                  <Image
                    className="h-12 w-12 rounded-full"
                    src={user.profileImageUrl}
                    alt="Profile image"
                    width={48}
                    height={48}
                  />
                  <div>
                    <p className="text-lg font-medium">{user?.fullName}</p>
                    {user?.primaryEmailAddress && (
                      <p className="text-sm">
                        {user?.primaryEmailAddress.emailAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="px-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Cabins & Cottages
                  </a>

                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Entire Homes
                  </a>

                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Unique Stays
                  </a>
                </div>
                <div className="mt-6">
                  {!isSignedIn ? (
                    <SignInButton mode="redirect">
                      <button className="flex w-full items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm">
                        Sign in
                      </button>
                    </SignInButton>
                  ) : (
                    <button
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm"
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onClick={() => signOut()}
                    >
                      <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      <main className="mx-auto px-6 py-6 sm:px-6 md:max-w-7xl xl:px-0">
        <CreateListing />
        <Listings />
      </main>
    </>
  );
};

export default Home;
