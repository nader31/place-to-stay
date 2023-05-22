import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import React, { useState } from "react";
import PageLayout from "~/components/layout";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import clsx from "clsx";
import moment from "moment";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PencilIcon } from "@heroicons/react/24/outline";

type SingleListing = RouterOutputs["listings"]["getById"];

const ImageGallery = (props: { data: SingleListing }) => {
  const { data } = props;
  if (!data.listing) {
    return <div />;
  }
  const images = data.listing.images;
  const title = data.listing.title;

  return (
    <div className="my-10 w-full overflow-hidden rounded-2xl">
      {images && images[0] && (
        <div className="grid h-[48rem] gap-2 lg:h-[32rem] lg:grid-cols-2">
          <Image
            src={images[0].url}
            alt={title}
            width={500}
            height={500}
            className="h-[16rem] w-full object-cover lg:h-[32rem]"
          />
          {images.length > 1 && (
            <div
              className={clsx(
                "grid h-[32rem] gap-2",
                images.slice(1, 5).length === 3
                  ? "grid-cols-2 grid-rows-2"
                  : images.slice(1, 5).length === 1
                  ? ""
                  : images.slice(1, 5).length === 2
                  ? "grid-cols-2 grid-rows-1"
                  : "grid-cols-2 grid-rows-2"
              )}
            >
              {images.slice(1, 5).map((image, index) => {
                return (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={title}
                    width={500}
                    height={500}
                    className={clsx(
                      "h-full w-full object-cover",
                      images.slice(1, 5).length === 3 &&
                        index === 2 &&
                        "col-span-2"
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BookingView = (props: { data: SingleListing }) => {
  const { data } = props;
  const [value, setValue] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
  });

  if (!data.listing) {
    return <div />;
  }

  const handleValueChange = (newValue: DateValueType) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };

  return (
    <div className="mt-10 flex w-full flex-col gap-8 rounded-2xl border p-5 shadow-lg lg:col-span-4 lg:mt-0">
      <p className="font-semibold">Brief information</p>
      <div className="flex items-center justify-around rounded-xl bg-gray-100 p-4 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <svg
            className="h-6 w-6 p-0.5"
            viewBox="0 0 55 75"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="27.5"
              cy="19.5"
              r="15.5"
              stroke="currentColor"
              stroke-width="7"
            />
            <path
              d="M51 71H4V62C4 54.268 10.268 48 18 48H37C44.732 48 51 54.268 51 62V71Z"
              stroke="currentColor"
              stroke-width="7"
            />
          </svg>
          <span>{data.listing.beds * 2}</span>
        </div>
        <div className="flex items-center gap-2">
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
          <span>{data.listing.beds}</span>
        </div>
        <div className="flex items-center gap-2">
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
          <span>{data.listing.baths}</span>
        </div>
      </div>
      <div>
        <div className="flex justify-around">
          <h2 className="text-2xl font-light text-gray-500">
            <span className="text-3xl font-bold text-black">
              {data.listing.price}€
            </span>{" "}
            /night
          </h2>
        </div>
      </div>
      <Datepicker
        startWeekOn="mon"
        minDate={new Date()}
        primaryColor="rose"
        value={value}
        onChange={handleValueChange}
        useRange={false}
        separator={"to"}
        displayFormat={"DD/MM/YYYY"}
        inputClassName={
          "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
        }
        disabledDates={[]}
      />
      <button className="flex w-full items-center justify-center rounded-lg bg-black py-3 font-medium text-white">
        Book Now
      </button>
    </div>
  );
};

const DescriptionView = (props: { data: SingleListing }) => {
  const { data } = props;
  if (!data.listing) return <div />;

  return (
    <div className="col-span-7">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-2xl font-medium">
            Listing By {data.author.name}
          </h3>
          <p className="mt-2 text-lg text-gray-500">
            Posted {moment(data.listing.createdAt).fromNow()}
          </p>
        </div>
        <Link href={`/${data.author.id}`}>
          <Image
            src={data.author.profileImageURL}
            className="h-16 w-16 rounded-full"
            alt="Profile image"
            width={50}
            height={50}
          />
        </Link>
      </div>
      <div className="mt-8">{data.listing.description}</div>
    </div>
  );
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const SingleListingPage: NextPage<PageProps> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data } = api.listings.getById.useQuery({
    id: props.id,
  });
  const { user } = useUser();
  if (!data?.listing || !data?.author) return <div />;

  const isOwner = user?.id === data.listing.userId ? true : false;

  return (
    <>
      <Head>
        <title>{data.listing.title}</title>
      </Head>
      <PageLayout>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold">{data.listing.title}</h1>
              <h2 className="text-xl text-gray-500">
                {data.listing.city}, {data.listing.country}
              </h2>
            </div>
            {isOwner && (
              <Link
                href={`/listing/${data.listing.id}/edit`}
                className="rounded-full p-2 hover:bg-gray-50"
              >
                <PencilIcon className="h-6 w-6" />
              </Link>
            )}
          </div>
          <div className="mt-2 flex gap-3">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5" />
              <span className="text-lg font-medium">4.5</span>
            </div>
          </div>
          <ImageGallery data={data} />
          <div className="gap-24 lg:grid lg:grid-cols-11 lg:items-start">
            <DescriptionView data={data} />
            <BookingView data={data} />
          </div>
        </div>
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
