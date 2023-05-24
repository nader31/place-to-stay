import type { NextPage } from "next";
import Head from "next/head";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import Link from "next/link";
import PageLayout from "~/components/layout";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { SelectCategory } from "./listing/create";
import type { Category } from "~/server/api/routers/listings";

export type ListingWithUser = RouterOutputs["listings"]["getAll"][number];
export const ListingView = (props: ListingWithUser) => {
  const { listing, author } = props;
  return (
    <Link
      href={`/listing/${listing.id}`}
      key={listing.id}
      className="overflow-hidden"
    >
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
          {listing.city}, {listing.country}
        </p>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-400">
          {listing.title}
        </p>
        <p className="mt-2">
          <span className="font-bold">{listing.price}€</span> /night
        </p>
        {author && (
          <Link href={`/${author.id}`} className="mt-2 flex items-center gap-2">
            <Image
              src={author?.profileImageURL}
              className="h-5 w-5 rounded-full"
              alt="Profile image"
              width={20}
              height={20}
            />
            <p className="text-xs">{author?.name}</p>
          </Link>
        )}
      </div>
    </Link>
  );
};

const Listings = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const { data, isLoading: listingsLoading } = api.listings.getAll.useQuery();

  if (listingsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  const filteredData = data.filter(
    (item) =>
      (item?.listing?.city?.toLowerCase().includes(search.toLowerCase()) ||
        item?.listing?.country?.toLowerCase().includes(search.toLowerCase()) ||
        item?.listing?.title.toLowerCase().includes(search.toLowerCase())) &&
      item?.listing?.category === category
  );

  return (
    <div>
      <div className="mx-auto mb-10 max-w-2xl">
        <div className="relative flex w-full items-center overflow-hidden rounded-full border bg-white">
          <div className="grid h-full place-items-center p-5 text-gray-300">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
          <input
            className="peer h-full w-full pr-8 text-sm text-gray-700 outline-none"
            type="search"
            id="search"
            placeholder="Search a city, country or listing..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            autoFocus
            onBlur={() => {
              document.getElementById("search")?.blur();
            }}
          />
        </div>
        <SelectCategory category={category} setCategory={setCategory} />
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {filteredData.map((fullListing) => (
          <ListingView {...fullListing} key={fullListing.listing.id} />
        ))}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Place To Stay</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <svg
          version="1.1"
          id="Calque_1"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-10 mt-5 hidden h-14 md:block"
          viewBox="0 0 2000 2000"
        >
          <path
            d="M1817.6,534.1L1484,200.5c-11.6-11.6-23.6-22.8-35.9-33.5C1323.7,59,1166.4,0,1000,0v0C833.6,0,676.3,59,551.9,167
	c-12.3,10.6-24.3,21.8-35.9,33.5L182.4,534.1C65.6,650.9,0,809.3,0,974.5V1189v328.4C0,1783.9,216.1,2000,482.7,2000H1000l0,0h517.3
	c266.6,0,482.7-216.1,482.7-482.7V1189V974.5C2000,809.3,1934.4,650.9,1817.6,534.1z M1665.9,1517.3c0,82.1-66.5,148.6-148.6,148.6
	h-231.6v-296.7c0-157.8-127.9-285.7-285.7-285.7h0l0,0h0c-157.8,0-285.7,127.9-285.7,285.7v296.7H482.7
	c-82.1,0-148.6-66.5-148.6-148.6v-473.6c0-121,48.1-237,133.6-322.5l284.6-284.6c66.2-66.1,154.2-102.6,247.8-102.6v0
	c93.6,0,181.6,36.5,247.8,102.6l284.6,284.6c85.5,85.5,133.6,201.5,133.6,322.5V1517.3z"
          />
        </svg>
        <h1 className="mb-10 text-center text-5xl font-bold">
          Find your place to <span className="text-rose-600">stay</span>
        </h1>
        <Listings />
      </PageLayout>
    </>
  );
};

export default Home;
