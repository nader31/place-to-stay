import { SignInButton, UserButton, useClerk, useUser } from "@clerk/nextjs";
import { Popover, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { api } from "~/utils/api";

export default function Header() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  api.listings.getAll.useQuery();

  const { signOut } = useClerk();

  if (!userLoaded) return <div />;

  return (
    <Popover className="sticky top-0 z-30 w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-6 md:justify-start md:space-x-10 xl:px-0">
        <div>
          <Link href="/" className="flex py-2">
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
          </Link>
        </div>
        <div className="-my-2 -mr-2 md:hidden">
          <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-black hover:bg-gray-100 focus:outline-none">
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </Popover.Button>
        </div>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <Popover.Group as="nav" className="flex items-center space-x-10">
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
            <Link
              href="/bookings"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              My Bookings
            </Link>
            {isSignedIn && (
              <Link
                href="/listing/create"
                className="my-auto rounded-full bg-neutral-900 px-3 py-1 text-base font-medium text-white hover:bg-black"
              >
                Add Listing
              </Link>
            )}
          </Popover.Group>
          <div className="flex items-center md:ml-12">
            {!isSignedIn && (
              <SignInButton mode="redirect">
                <button className="ml-8 inline-flex items-center justify-center rounded-full border border-transparent bg-neutral-900 px-4 py-1 font-medium text-white shadow-sm hover:bg-black">
                  Sign in
                </button>
              </SignInButton>
            )}
            <UserButton
              userProfileMode="navigation"
              userProfileUrl={`/${user?.id || ""}`}
              afterSignOutUrl="/"
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
                <Link href={"/"}>
                  <svg
                    className="h-7 w-7 outline-none"
                    viewBox="0 0 108 108"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.8496 28.8414L27.864 10.827C28.4904 10.2006 29.1384 9.5958 29.8026 9.018C36.5202 3.186 45.0144 0 54 0C62.9856 0 71.4798 3.186 78.1974 9.018C78.8616 9.5904 79.5096 10.1952 80.136 10.827L98.1504 28.8414C104.458 35.1486 108 43.7022 108 52.623V64.206V81.9396C108 96.3306 96.3306 108 81.9342 108H54H26.0658C11.6694 108 -2.80142e-06 96.3306 -2.80142e-06 81.9342V64.206V52.623C-2.80142e-06 43.7022 3.5424 35.1486 9.8496 28.8414ZM18.0414 81.9342C18.0414 86.3676 21.6324 89.9586 26.0658 89.9586H38.5722V73.9368C38.5722 65.4156 45.4788 58.509 54 58.509C62.5212 58.509 69.4278 65.4156 69.4278 73.9368V89.9586H81.9342C86.3676 89.9586 89.9586 86.3676 89.9586 81.9342V56.3598C89.9586 49.8258 87.3612 43.5618 82.7442 38.9448L67.3758 23.5764C63.801 20.007 59.049 18.036 53.9946 18.036C48.9402 18.036 44.1882 20.007 40.6134 23.5764L25.245 38.9448C20.628 43.5618 18.0306 49.8258 18.0306 56.3598V81.9342H18.0414Z"
                      fill="black"
                    />
                  </svg>
                </Link>
                <div className="-mr-2">
                  <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
            {isSignedIn && (
              <Link href={`/` + user?.id || ""}>
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
              </Link>
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

                <Link
                  href="/bookings"
                  className="text-base font-medium text-gray-900 hover:text-gray-700"
                >
                  My Bookings
                </Link>
                <Link
                  href="/listing/create"
                  className="text-base font-medium text-gray-900 hover:text-gray-700"
                >
                  Add listing
                </Link>
              </div>
              <div className="mt-6">
                {!isSignedIn ? (
                  <SignInButton mode="redirect">
                    <button className="flex w-full items-center justify-center rounded-md border border-transparent bg-neutral-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-black">
                      Sign in
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-neutral-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-black"
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
  );
}
