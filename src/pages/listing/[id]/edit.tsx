import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import React, { Fragment, useState } from "react";
import PageLayout from "~/components/layout";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { api } from "~/utils/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RangeSlider from "~/components/rangeSlider";
import LoadingSpinner from "~/components/loading";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const SingleListingPage: NextPage<PageProps> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data } = api.listings.getById.useQuery({
    id: props.id,
  });
  const { user } = useUser();

  const [title, setTitle] = useState(data?.listing?.title || "");
  const [description, setDescription] = useState(
    data?.listing?.description || ""
  );
  const [price, setPrice] = useState(data?.listing?.price || 0);
  const [beds, setBeds] = useState(data?.listing?.beds || 0);
  const [baths, setBaths] = useState(data?.listing?.baths || 0);
  const [city, setCity] = useState(data?.listing?.city || "");
  const [images, setImages] = useState<string[]>(
    data?.listing?.images.map((image) => image.url) || []
  );

  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const { mutate, isLoading: isUpdating } = api.listings.update.useMutation({
    onSuccess: (listing) => {
      toast.success(`Listing ${listing.title} updated`);
      void router.push(`/listing/${listing.id}`);
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

  const { mutate: deleteListing, isLoading: isDeleting } =
    api.listings.delete.useMutation({
      onSuccess: () => {
        toast.success(`Listing deleted`);
        void router.push(`/${user?.id || ""}`);
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    });

  if (!data?.listing || !data?.author) return <div />;

  const isOwner = user?.id === data.listing.userId ? true : false;

  const handleSubmit = () => {
    mutate({
      title,
      description,
      price,
      beds,
      baths,
      city,
      images: images.map((image) => ({ url: image })),
      id: data?.listing?.id || "",
    });
  };

  const handleDelete = () => {
    deleteListing({ id: data?.listing?.id || "" });
  };

  return (
    <>
      <Head>
        <title>{data.listing.title}</title>
      </Head>
      <PageLayout>
        <div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Title"
              className="h-12 w-full text-4xl font-semibold outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUpdating}
            />
            {isOwner && (
              <Link
                href={`/listing/${data.listing.id}`}
                className="rounded-full p-2 hover:bg-gray-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </Link>
            )}
          </div>

          <div className="mt-10 flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3">
              <label htmlFor="city" className="font-medium">
                City
              </label>
              <input
                placeholder="Description"
                className="max-w-sm rounded-md border p-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isUpdating}
                id="city"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="description" className="font-medium">
                Description
              </label>
              <textarea
                placeholder="Description"
                className="resize-none rounded-md border p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUpdating}
                id="description"
              ></textarea>
            </div>
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
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              </div>
            </div>
            <p className="mt-3 font-medium">Update images</p>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            {[...Array(images.filter((image) => image !== "").length + 1)].map(
              (_, i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full rounded-md border p-2"
                    value={images[i] || ""}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[i] = e.target.value;
                      setImages(newImages.filter((image) => image !== ""));
                    }}
                    disabled={isUpdating}
                  />
                </div>
              )
            )}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="p-1">
                    <LoadingSpinner color="white" />
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={handleSubmit}
                className="flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white hover:bg-black"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="p-1">
                    <LoadingSpinner color="white" />
                  </div>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50"
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Delete listing
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this listing? This
                        action cannot be undone.
                      </p>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </PageLayout>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
    },
  });
  return {
    paths: listings.map((listing) => ({
      params: {
        id: listing.id,
      },
    })),
    fallback: "blocking",
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const id = context.params?.id as string;
  await helpers.listings.getById.prefetch({ id });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 1,
  };
}

export default SingleListingPage;
