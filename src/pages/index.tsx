import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import Link from "next/link";
import PageLayout from "~/components/layout";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import type { SetStateAction } from "react";
import { useState } from "react";
import { SelectCategory } from "./listing/create";
import type { Category } from "~/server/api/routers/listings";
import type { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import Datepicker from "react-tailwindcss-datepicker";
import clsx from "clsx";
import { StarIcon } from "@heroicons/react/24/solid";
import type {
  Booking,
  Image as ImageType,
  Listing,
  Review,
  Status,
} from "@prisma/client";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";
import { Transition } from "@headlessui/react";

export type ListingWithUser = {
  listing: Listing & {
    review?: Review[];
    images: ImageType[];
    bookings: Booking[];
  };
  author:
    | {
        id: string;
        name: string;
        profileImageURL: string;
      }
    | undefined;
  stars?: number | undefined;
  favorite?: boolean;
  bookingStatus?: Status;
  favorites?: number;
};

export const ListingView = (props: ListingWithUser) => {
  const { listing, author, stars, favorite, favorites, bookingStatus } = props;

  const [isFavorite, setIsFavorite] = useState(favorite);

  const [currentFavoriteCount, setCurrentFavoriteCount] = useState(favorites);

  const { mutate: addFavorite } = api.favorites.create.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
      setIsFavorite(true);
      setCurrentFavoriteCount((prev) => (prev || 0) + 1);
    },
  });
  const { mutate: removeFavorite } = api.favorites.delete.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
      setIsFavorite(false);
      setCurrentFavoriteCount((prev) => (prev || 0) - 1);
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFavorite) {
      addFavorite({ listingId: listing.id });
    } else {
      removeFavorite({ listingId: listing.id });
    }
  };

  return (
    <Link
      href={`/listing/${listing.id}`}
      key={listing.id}
      className="relative overflow-hidden"
    >
      {typeof favorites === "number" && (
        <>
          <p className="absolute right-12 top-4 z-10 rounded-full p-1 text-end text-sm font-medium text-white">
            <span className="font-bold">{currentFavoriteCount}</span>
          </p>
          <Transition
            show={isFavorite}
            className="absolute right-4 top-4 z-10"
            enter="transition duration-100 ease-in-out"
            enterFrom="scale-0"
            enterTo="scale-100"
            leave="transition duration-100 ease-in-out"
            leaveFrom="scale-100"
            leaveTo="scale-0"
          >
            <button onClick={handleFavorite}>
              <HeartIconSolid className="h-8 w-8 scale-100 text-white drop-shadow-[0_0px_10px_rgba(255,255,255,0)] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0px_10px_rgba(255,255,255,0.20)]" />
            </button>
          </Transition>
          <Transition
            show={!isFavorite}
            className="absolute right-4 top-4 z-10"
            enter="transition duration-100 ease-in-out"
            enterFrom="scale-100"
            enterTo="scale-100"
            leave="transition duration-100 ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-100"
          >
            <button onClick={handleFavorite}>
              <HeartIcon className="h-8 w-8 scale-100 text-white drop-shadow-[0_0px_10px_rgba(255,255,255,0)] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0px_10px_rgba(255,255,255,0.20)]" />
            </button>
          </Transition>
        </>
      )}

      <div className="absolute h-72 w-full rounded-3xl bg-gradient-to-bl from-black/50 via-transparent"></div>
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
        <div className="flex items-center justify-between gap-2">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
            {listing.city}, {listing.country}
          </p>
          {stars && (
            <div className="flex items-center gap-1">
              <StarIcon className="h-5 w-5 text-rose-600" />
              <p className="font-medium">{stars.toFixed(1)}</p>
            </div>
          )}
        </div>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-400">
          {listing.title}
        </p>
        <div className="mt-2 flex justify-between">
          <p>
            <span className="font-bold">{listing.price}€</span> /night
          </p>
        </div>
        <div className="flex justify-between">
          {author && (
            <Link
              href={`/${author.id}`}
              className="mt-2 flex items-center gap-2"
            >
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
          {bookingStatus && (
            <span
              className={clsx(
                "ml-2 inline-flex h-fit items-center rounded-md px-2 py-1 text-xs font-medium capitalize",
                bookingStatus === "pending" && "bg-yellow-100 text-yellow-600",
                bookingStatus === "confirmed" && "bg-green-100 text-green-600",
                bookingStatus === "canceled" && "bg-red-100 text-red-600"
              )}
            >
              {bookingStatus}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Listings = (props: {
  dates: DateValueType;
  search: string;
  category: Category | undefined;
  page: number;
  setPage: React.Dispatch<SetStateAction<number>>;
  beds: number | undefined;
}) => {
  const { dates, search, category, page, setPage, beds } = props;

  const {
    data: availableListings,
    isLoading: listingsLoading,
    fetchNextPage,
  } = api.listings.getAllByAvailableDates.useInfiniteQuery(
    {
      startDate: !dates?.startDate
        ? undefined
        : new Date(dates?.startDate?.toString()),
      endDate: !dates?.endDate
        ? undefined
        : new Date(dates?.endDate?.toString()),
      limit: 8,
      search,
      category,
      beds,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (listingsLoading) return <LoadingPage />;

  if (!availableListings) return <div>Something went wrong</div>;

  const listingsToShow = availableListings?.pages[page]?.listings;

  const handleFetchNextPage = () => {
    void fetchNextPage();
    setPage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = () => {
    setPage((prev) => prev - 1);
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {listingsToShow?.map((fullListing) => (
          <ListingView {...fullListing} key={fullListing.listing.id} />
        ))}
      </div>
      {listingsToShow?.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <svg
            className="h-12 w-12"
            viewBox="0 0 45 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.0061 14.228C28.0061 14.297 28.0051 14.366 28.0041 14.435L28.0031 14.515V14.527V14.539L28.0081 14.802V14.811V14.82L28.0361 15.296L28.0381 15.348L28.0531 15.399C28.2561 16.143 28.6931 16.789 29.4021 17.251C30.0571 17.677 30.9171 17.928 31.9841 17.986V18.987C30.6351 18.917 29.5721 18.565 28.7811 18.031L28.0011 17.504V18.445V21.5V22H28.5011H29.5011C29.6601 22 29.8081 22.076 29.9021 22.201L29.9491 22.276L36.9411 35.263C37.1091 35.574 36.9091 35.949 36.5731 35.995L36.4881 36H8.50114C8.14814 36 7.91214 35.646 8.03115 35.329L8.06814 35.251L15.0611 22.263C15.1431 22.111 15.2771 22.027 15.4241 22.006L15.4621 22H26.5011H27.0011V21.5L27.0031 18.446V17.505L26.2231 18.031C25.4321 18.565 24.3701 18.917 23.0211 18.987V17.986C24.0451 17.93 24.8771 17.697 25.5211 17.302C26.2771 16.839 26.7421 16.173 26.9521 15.399L26.9651 15.353L26.9691 15.306L26.9841 15.122V15.114V15.106L26.9971 14.814V14.8L27.0011 14.556V14.548L27.0031 13.458V12.366L26.1761 13.079C25.3941 13.753 24.3511 14.195 23.0211 14.284V13.281C24.0451 13.199 24.8871 12.863 25.5381 12.297C26.2871 11.645 26.7341 10.732 26.9451 9.688L26.9471 9.679L26.9491 9.67L26.9691 9.541L26.9711 9.533V9.526C26.9881 9.399 26.9991 9.267 27.0031 9.143V9.122V9.102L26.9991 9.023V9H28.0011V9.216H28.0061C28.0111 9.321 28.0211 9.426 28.0341 9.526V9.533L28.0361 9.541L28.0571 9.67L28.0591 9.679L28.0601 9.688C28.2631 10.696 28.6861 11.582 29.3911 12.229C30.0501 12.834 30.9181 13.196 31.9841 13.281V14.284C30.6531 14.195 29.6091 13.751 28.8271 13.077L28.0011 12.363V13.456V13.784V14.228H28.0061ZM15.0011 26.465L14.0601 26.228L9.73615 34.263L9.33814 35H10.1761H14.5011H15.0011V34.5V26.465ZM34.8271 34.999H35.6631L35.2661 34.262L29.3441 23.262L29.2021 22.999H28.9041L17.1761 23H16.3381L16.7341 23.737L22.6571 34.737L22.7991 35H23.0981L34.8271 34.999ZM16.9411 26.231L16.0011 26.468V34.5V35H16.5011H20.8271H21.6631L21.2661 34.263L16.9411 26.231ZM14.5011 11C16.4341 11 18.0011 12.567 18.0011 14.5C18.0011 16.433 16.4341 18 14.5011 18C12.5681 18 11.0011 16.433 11.0011 14.5C11.0011 12.567 12.5681 11 14.5011 11ZM14.5011 12C13.1201 12 12.0011 13.119 12.0011 14.5C12.0011 15.881 13.1201 17 14.5011 17C15.8821 17 17.0011 15.881 17.0011 14.5C17.0011 13.119 15.8821 12 14.5011 12Z"
              fill="currentColor"
            />
            <path
              d="M28.0061 14.228C28.0061 14.297 28.0051 14.366 28.0041 14.435L28.0031 14.515V14.527V14.539L28.0081 14.802V14.811V14.82L28.0361 15.296L28.0381 15.348L28.0531 15.399C28.2561 16.143 28.6931 16.789 29.4021 17.251C30.0571 17.677 30.9171 17.928 31.9841 17.986V18.987C30.6351 18.917 29.5721 18.565 28.7811 18.031L28.0011 17.504V18.445V21.5V22H28.5011H29.5011C29.6601 22 29.8081 22.076 29.9021 22.201L29.9491 22.276L36.9411 35.263C37.1091 35.574 36.9091 35.949 36.5731 35.995L36.4881 36H8.50114C8.14814 36 7.91214 35.646 8.03115 35.329L8.06814 35.251L15.0611 22.263C15.1431 22.111 15.2771 22.027 15.4241 22.006L15.4621 22H26.5011H27.0011V21.5L27.0031 18.446V17.505L26.2231 18.031C25.4321 18.565 24.3701 18.917 23.0211 18.987V17.986C24.0451 17.93 24.8771 17.697 25.5211 17.302C26.2771 16.839 26.7421 16.173 26.9521 15.399L26.9651 15.353L26.9691 15.306L26.9841 15.122V15.114V15.106L26.9971 14.814V14.8L27.0011 14.556V14.548L27.0031 13.458V12.366L26.1761 13.079C25.3941 13.753 24.3511 14.195 23.0211 14.284V13.281C24.0451 13.199 24.8871 12.863 25.5381 12.297C26.2871 11.645 26.7341 10.732 26.9451 9.688L26.9471 9.679L26.9491 9.67L26.9691 9.541L26.9711 9.533V9.526C26.9881 9.399 26.9991 9.267 27.0031 9.143V9.122V9.102L26.9991 9.023V9H28.0011V9.216H28.0061C28.0111 9.321 28.0211 9.426 28.0341 9.526V9.533L28.0361 9.541L28.0571 9.67L28.0591 9.679L28.0601 9.688C28.2631 10.696 28.6861 11.582 29.3911 12.229C30.0501 12.834 30.9181 13.196 31.9841 13.281V14.284C30.6531 14.195 29.6091 13.751 28.8271 13.077L28.0011 12.363V13.456V13.784V14.228H28.0061ZM15.0011 26.465L14.0601 26.228L9.73615 34.263L9.33814 35H10.1761H14.5011H15.0011V34.5V26.465ZM34.8271 34.999H35.6631L35.2661 34.262L29.3441 23.262L29.2021 22.999H28.9041L17.1761 23H16.3381L16.7341 23.737L22.6571 34.737L22.7991 35H23.0981L34.8271 34.999ZM16.9411 26.231L16.0011 26.468V34.5V35H16.5011H20.8271H21.6631L21.2661 34.263L16.9411 26.231ZM14.5011 11C16.4341 11 18.0011 12.567 18.0011 14.5C18.0011 16.433 16.4341 18 14.5011 18C12.5681 18 11.0011 16.433 11.0011 14.5C11.0011 12.567 12.5681 11 14.5011 11ZM14.5011 12C13.1201 12 12.0011 13.119 12.0011 14.5C12.0011 15.881 13.1201 17 14.5011 17C15.8821 17 17.0011 15.881 17.0011 14.5C17.0011 13.119 15.8821 12 14.5011 12Z"
              stroke="currentColor"
            />
          </svg>
          <p className="mt-4 text-2xl font-semibold">No listings found</p>
          <p className="mt-2 text-sm text-gray-400">Try changing your search</p>
        </div>
      ) : (
        <PageNav
          handleFetchNextPage={handleFetchNextPage}
          handleFetchPreviousPage={handleFetchPreviousPage}
          page={page}
          totalListings={availableListings.pages[page]?.listingsCount}
          isLastPage={!availableListings.pages[page]?.nextCursor}
        />
      )}
    </div>
  );
};

const SearchBar = (props: {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  category: Category | undefined;
  setCategory: React.Dispatch<React.SetStateAction<Category | undefined>>;
  dates: DateValueType;
  handleValueChange: (newValue: DateValueType) => void;
  beds: number | undefined;
  setBeds: React.Dispatch<React.SetStateAction<number | undefined>>;
}) => {
  const {
    search,
    setSearch,
    category,
    setCategory,
    dates,
    handleValueChange,
    setPage,
    beds,
    setBeds,
  } = props;

  return (
    <div className="mx-auto mb-10 max-w-2xl">
      <div className="rounded-3xl border bg-white shadow-lg">
        <div className="relative flex w-full items-center overflow-hidden rounded-full">
          <div className="grid h-full place-items-center p-5 text-gray-300">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
          <input
            className="peer h-full w-full pr-8 text-sm text-gray-700 outline-none"
            type="search"
            id="search"
            placeholder="Search a city, country or listing..."
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            value={search}
            autoFocus
            onBlur={() => {
              document.getElementById("search")?.blur();
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-2">
          <Datepicker
            startWeekOn="mon"
            minDate={new Date()}
            primaryColor="rose"
            value={dates}
            onChange={handleValueChange}
            useRange={false}
            separator={"to"}
            displayFormat={"DD/MM/YYYY"}
            inputClassName={
              "w-full border rounded-lg px-3 py-2 focus:outline-none"
            }
            placeholder="Select your dates"
            popoverDirection="down"
          />
          <div className="w-full">
            <div className="flex items-center gap-3 rounded-md border px-4 py-2">
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                  className="h-5 w-5"
                >
                  <path d="M26 4a2 2 0 0 1 1.995 1.85L28 6v7.839l1.846 5.537a3 3 0 0 1 .115.468l.03.24.009.24V30h-2v-2H4v2H2v-9.675a3 3 0 0 1 .087-.717l.067-.232L4 13.836V6a2 2 0 0 1 1.697-1.977l.154-.018L6 4zm2 18H4v4h24zm-1.388-6H5.387l-1.333 4h23.891zM26 6H6v8h2v-4a2 2 0 0 1 1.85-1.995L10 8h12a2 2 0 0 1 1.995 1.85L24 10v4h2zm-11 4h-5v4h5zm7 0h-5v4h5z"></path>
                </svg>
                <p>Beds</p>
              </div>
              <div className=" grid w-full grid-cols-5 gap-2">
                <button
                  className={clsx(
                    "rounded-lg py-1 text-xs font-bold",
                    beds === 1
                      ? "bg-neutral-900 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setPage(0);
                    beds === 1 ? setBeds(undefined) : setBeds(1);
                  }}
                >
                  1
                </button>
                <button
                  className={clsx(
                    "rounded-lg py-1 text-xs font-bold",
                    beds === 2
                      ? "bg-neutral-900 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setPage(0);
                    beds === 2 ? setBeds(undefined) : setBeds(2);
                  }}
                >
                  2
                </button>
                <button
                  className={clsx(
                    "rounded-lg py-1 text-xs font-bold",
                    beds === 3
                      ? "bg-neutral-900 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setPage(0);
                    beds === 3 ? setBeds(undefined) : setBeds(3);
                  }}
                >
                  3
                </button>
                <button
                  className={clsx(
                    "rounded-lg py-1 text-xs font-bold",
                    beds === 4
                      ? "bg-neutral-900 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setPage(0);
                    beds === 4 ? setBeds(undefined) : setBeds(4);
                  }}
                >
                  4
                </button>
                <button
                  className={clsx(
                    "rounded-lg py-1 text-xs font-bold",
                    beds === 5
                      ? "bg-neutral-900 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setPage(0);
                    beds === 5 ? setBeds(undefined) : setBeds(5);
                  }}
                >
                  5+
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-1">
          <SelectCategory
            setPage={setPage}
            category={category}
            setCategory={setCategory}
          />
        </div>
      </div>
    </div>
  );
};

const PageNav = (props: {
  page: number;
  handleFetchNextPage: () => void;
  handleFetchPreviousPage: () => void;
  totalListings?: number;
  isLastPage: boolean;
}) => {
  const {
    page,
    handleFetchNextPage,
    handleFetchPreviousPage,
    totalListings,
    isLastPage,
  } = props;
  return (
    <div className="mt-8 flex flex-col items-center">
      <span className="text-sm text-gray-700 dark:text-gray-400">
        Page <span className="font-semibold text-gray-900">{page + 1}</span> of{" "}
        <span className="font-semibold text-gray-900">
          {totalListings && Math.ceil(totalListings / 8)}
        </span>
      </span>
      <div className="xs:mt-0 mt-2 inline-flex">
        <button
          onClick={handleFetchPreviousPage}
          disabled={page < 1}
          className="rounded-l-md border-y border-l bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Prev
        </button>
        <button
          disabled={isLastPage}
          onClick={handleFetchNextPage}
          className="rounded-r-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [dates, setDates] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const [beds, setBeds] = useState<number | undefined>();
  const [page, setPage] = useState(0);

  const handleValueChange = (newValue: DateValueType) => {
    setPage(0);
    setDates(newValue);
  };

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
        <SearchBar
          beds={beds}
          setBeds={setBeds}
          setPage={setPage}
          category={category}
          dates={dates}
          setCategory={setCategory}
          search={search}
          handleValueChange={handleValueChange}
          setSearch={setSearch}
        />
        <Listings
          beds={beds}
          category={category}
          dates={dates}
          search={search}
          page={page}
          setPage={setPage}
        />
      </PageLayout>
    </>
  );
};

export default Home;
