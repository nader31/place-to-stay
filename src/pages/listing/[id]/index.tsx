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
import { useClerk, useUser } from "@clerk/nextjs";
import { PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import LoadingSpinner from "~/components/loading";

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

const BookingView = (props: { data: SingleListing; isOwner: boolean }) => {
  const { data, isOwner } = props;
  const [dates, setDates] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  if (!data.listing) {
    return <div />;
  }

  const { data: booking } = api.booking.getByUserAndListing.useQuery({
    listingId: data.listing.id,
    userId: user?.id,
  });

  const handleValueChange = (newValue: DateValueType) => {
    setDates(newValue);
  };
  const ctx = api.useContext();

  const { mutate, isLoading } = api.booking.create.useMutation({
    onSuccess: () => {
      void ctx.booking.getByUserAndListing.invalidate({
        listingId: data?.listing?.id,
        userId: user?.id,
      });
      toast.success("Booking created successfully");
    },
    onError: () => {
      toast.error("Error creating booking");
    },
  });

  const { data: bookingDates } = api.booking.getBookingDatesByListing.useQuery({
    listingId: data.listing.id,
  });

  const { data: bookingByListing } = api.booking.getByListing.useQuery({
    listingId: data.listing.id,
  });

  const { mutate: deleteBooking, isLoading: isDeleting } =
    api.booking.deleteByUserAndListing.useMutation({
      onSuccess: () => {
        void ctx.booking.getByUserAndListing.invalidate({
          listingId: data?.listing?.id,
          userId: user?.id,
        });
        toast.success("Booking deleted successfully");
      },
      onError: () => {
        toast.error("Error deleting booking");
      },
    });

  const handleSubmit = () => {
    if (!dates) return;
    const startDate = new Date(dates.startDate?.toString() || "");
    const endDate = new Date(dates.endDate?.toString() || "");
    if (data.listing?.id && user?.id) {
      mutate({
        listingId: data.listing.id,
        userId: user.id,
        startDate,
        endDate,
      });
    } else if (
      startDate > endDate ||
      startDate < new Date() ||
      endDate < new Date() ||
      bookingDates?.some((bookingDate) => {
        return (
          (startDate >= new Date(bookingDate.startDate) &&
            startDate <= new Date(bookingDate.endDate)) ||
          (endDate >= new Date(bookingDate.startDate) &&
            endDate <= new Date(bookingDate.endDate))
        );
      })
    ) {
      toast.error("Please enter valid dates");
    }
  };

  const handleDelete = () => {
    if (data.listing?.id && user?.id) {
      deleteBooking({
        listingId: data.listing.id,
        userId: user.id,
      });
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col gap-8 rounded-2xl border p-5 shadow-lg lg:col-span-4 lg:mt-0">
      <div className="flex justify-between">
        <div className="font-semibold">
          {booking ? (
            <p>
              Your booking{" "}
              <span
                className={clsx(
                  "ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize",
                  booking.booking.status === "pending" &&
                    "bg-yellow-100 text-yellow-600",
                  booking.booking.status === "confirmed" &&
                    "bg-green-100 text-green-600",
                  booking.booking.status === "canceled" &&
                    "bg-red-100 text-red-600"
                )}
              >
                {booking.booking.status}
              </span>
            </p>
          ) : (
            <p>Brief information</p>
          )}
        </div>
        {booking && <p>{moment(booking?.booking.startDate).fromNow()}</p>}
      </div>
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
          {!booking ? (
            <h2 className="text-2xl font-light text-gray-500">
              <span className="text-3xl font-bold text-black">
                {data.listing.price}€
              </span>{" "}
              /night
            </h2>
          ) : (
            <div className="text-center">
              <p className="text-3xl font-bold text-black">
                {booking.nights * data.listing.price}€
              </p>
            </div>
          )}
        </div>
      </div>
      {!isOwner &&
        (!booking ? (
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
              "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
            }
            popoverDirection="up"
            disabledDates={bookingDates}
            disabled={isLoading}
          />
        ) : (
          <div>
            <p className="mb-1 text-center font-semibold">
              Booking dates ({booking.nights} nights)
            </p>
            <div className="flex justify-around">
              <p className="text-xl text-gray-500">
                {moment(booking.booking.startDate).format("DD/MM/YYYY")} -{" "}
                {moment(booking.booking.endDate).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
        ))}
      {!isOwner ? (
        <button
          onClick={
            isSignedIn
              ? booking
                ? booking?.booking.status === "pending"
                  ? handleDelete
                  : () => {
                      return;
                    }
                : handleSubmit
              : () => {
                  openSignIn();
                }
          }
          disabled={
            isLoading ||
            isDeleting ||
            booking?.booking.status === "confirmed" ||
            booking?.booking.status === "canceled"
          }
          className={clsx(
            "flex w-full items-center justify-center rounded-lg py-3 font-medium text-white",
            booking
              ? booking.booking.status === "pending"
                ? "bg-red-500 hover:bg-red-600"
                : booking.booking.status === "confirmed"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-600"
              : "bg-neutral-900 hover:bg-black"
          )}
        >
          {isLoading || isDeleting ? (
            <div className="p-1">
              <LoadingSpinner
                color={
                  booking?.booking.status === "pending" ? "secondary" : "white"
                }
              />
            </div>
          ) : isSignedIn ? (
            booking ? (
              booking.booking.status === "pending" ? (
                "Cancel Booking"
              ) : booking.booking.status === "confirmed" ? (
                "Booking Confirmed"
              ) : (
                "Booking Canceled"
              )
            ) : (
              "Book Now"
            )
          ) : (
            "Sign in to book"
          )}
        </button>
      ) : (
        <div>
          <p className="mb-2 border-t pt-5 text-center text-5xl font-medium">
            {bookingByListing?.length}
          </p>
          <p className="mb-3 text-center text-lg">bookings</p>
        </div>
      )}
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
      <div className="mt-8">
        <div className="mb-2 flex w-min items-center gap-2">
          <div>
            {data.listing.category === "apartment" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M34 8.5C35.054 8.5 35.918 9.316 35.995 10.351L36 10.5V34.5C36 35.554 35.184 36.418 34.149 36.494L34 36.5H10C8.946 36.5 8.082 35.684 8.005 34.649L8 34.5V10.5C8 9.446 8.816 8.582 9.851 8.505L10 8.5H34ZM22 13.415L18.914 16.5H10V34.5H18V29.5C18 28.446 18.816 27.582 19.851 27.505L20 27.5H24C25.054 27.5 25.918 28.316 25.995 29.351L26 29.5V34.5H34V16.5H25.086L22 13.415ZM24 29.5H20V34.5H24V29.5ZM30 27.5C30.552 27.5 31 27.948 31 28.5C31 29.052 30.552 29.5 30 29.5C29.448 29.5 29 29.052 29 28.5C29 27.948 29.448 27.5 30 27.5ZM14 27.5C14.552 27.5 15 27.948 15 28.5C15 29.052 14.552 29.5 14 29.5C13.448 29.5 13 29.052 13 28.5C13 27.948 13.448 27.5 14 27.5ZM30 23.5C30.552 23.5 31 23.948 31 24.5C31 25.052 30.552 25.5 30 25.5C29.448 25.5 29 25.052 29 24.5C29 23.948 29.448 23.5 30 23.5ZM14 23.5C14.552 23.5 15 23.948 15 24.5C15 25.052 14.552 25.5 14 25.5C13.448 25.5 13 25.052 13 24.5C13 23.948 13.448 23.5 14 23.5ZM30 19.5C30.552 19.5 31 19.948 31 20.5C31 21.052 30.552 21.5 30 21.5C29.448 21.5 29 21.052 29 20.5C29 19.948 29.448 19.5 30 19.5ZM22 19.5C22.552 19.5 23 19.948 23 20.5C23 21.052 22.552 21.5 22 21.5C21.448 21.5 21 21.052 21 20.5C21 19.948 21.448 19.5 22 19.5ZM14 19.5C14.552 19.5 15 19.948 15 20.5C15 21.052 14.552 21.5 14 21.5C13.448 21.5 13 21.052 13 20.5C13 19.948 13.448 19.5 14 19.5ZM34 14.5V10.5H10V14.5H18.084L20.586 12C21.326 11.26 22.501 11.221 23.287 11.883L23.414 12L25.915 14.5H34Z"
                  fill="currentColor"
                />
              </svg>
            ) : data.listing.category === "house" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36.8125 7.606L37.7065 9.394L35.2595 10.618V35.5C35.2595 36.554 34.4435 37.418 33.4085 37.494L33.2595 37.5H11.2595C10.2055 37.5 9.3415 36.684 9.2655 35.649L9.2595 35.5V23.618L7.7065 24.394L6.8125 22.606L9.2595 21.383V13.5H11.2595V20.383L36.8125 7.606ZM33.2595 11.618L11.2595 22.618V35.5H17.2595V25.5C17.2595 24.446 18.0755 23.582 19.1105 23.505L19.2595 23.5H25.2595C26.3135 23.5 27.1775 24.316 27.2545 25.351L27.2595 25.5V35.5H33.2595V11.618ZM25.2595 25.5H19.2595V35.5H25.2595V25.5ZM30.2595 17.5C30.8115 17.5 31.2595 17.948 31.2595 18.5C31.2595 19.052 30.8115 19.5 30.2595 19.5C29.7075 19.5 29.2595 19.052 29.2595 18.5C29.2595 17.948 29.7075 17.5 30.2595 17.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : data.listing.category === "hotel" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M34 13.5H26V10.5C25.999 9.97 25.788 9.461 25.413 9.086C25.039 8.712 24.53 8.501 24 8.5H10C9.47 8.501 8.961 8.711 8.586 9.086C8.211 9.461 8.001 9.97 8 10.5V34.5C8.001 35.03 8.212 35.539 8.586 35.913C8.961 36.288 9.47 36.499 10 36.5H34C34.53 36.499 35.038 36.288 35.413 35.913C35.788 35.538 35.999 35.03 36 34.5V15.5C35.999 14.97 35.788 14.461 35.413 14.086C35.039 13.712 34.53 13.501 34 13.5ZM19 34.5H15V29.5H19V34.5ZM24 34.5H21V29.5C20.999 28.97 20.788 28.461 20.413 28.087C20.039 27.712 19.53 27.501 19 27.5H15C14.47 27.501 13.961 27.712 13.586 28.087C13.212 28.461 13.001 28.97 13 29.5V34.5H10L9.999 10.5H24V34.5ZM34 34.5H26V15.5H34V34.5ZM31 22.5C31 22.698 30.941 22.891 30.831 23.056C30.722 23.22 30.565 23.348 30.383 23.424C30.2 23.5 29.999 23.519 29.805 23.481C29.611 23.442 29.433 23.347 29.293 23.207C29.153 23.067 29.058 22.889 29.019 22.695C28.981 22.501 29 22.3 29.076 22.117C29.152 21.935 29.28 21.778 29.444 21.669C29.609 21.559 29.802 21.5 30 21.5C30.265 21.5 30.52 21.605 30.707 21.793C30.895 21.98 31 22.235 31 22.5ZM29 18.5C29 18.302 29.059 18.109 29.169 17.944C29.278 17.78 29.435 17.652 29.617 17.576C29.8 17.5 30.001 17.481 30.195 17.519C30.389 17.558 30.567 17.653 30.707 17.793C30.847 17.933 30.942 18.111 30.981 18.305C31.019 18.499 31 18.7 30.924 18.883C30.848 19.065 30.72 19.222 30.556 19.331C30.391 19.441 30.198 19.5 30 19.5C29.735 19.5 29.48 19.395 29.293 19.207C29.105 19.02 29 18.765 29 18.5ZM21 22.5C21 22.698 20.941 22.891 20.831 23.056C20.722 23.22 20.565 23.348 20.383 23.424C20.2 23.5 19.999 23.519 19.805 23.481C19.611 23.442 19.433 23.347 19.293 23.207C19.153 23.067 19.058 22.889 19.019 22.695C18.981 22.501 19 22.3 19.076 22.117C19.152 21.935 19.28 21.778 19.444 21.669C19.609 21.559 19.802 21.5 20 21.5C20.265 21.5 20.52 21.605 20.707 21.793C20.895 21.98 21 22.235 21 22.5ZM21 18.5C21 18.698 20.941 18.891 20.831 19.056C20.722 19.22 20.565 19.348 20.383 19.424C20.2 19.5 19.999 19.519 19.805 19.481C19.611 19.442 19.433 19.347 19.293 19.207C19.153 19.067 19.058 18.889 19.019 18.695C18.981 18.501 19 18.3 19.076 18.117C19.152 17.935 19.28 17.778 19.444 17.669C19.609 17.559 19.802 17.5 20 17.5C20.265 17.5 20.52 17.605 20.707 17.793C20.895 17.98 21 18.235 21 18.5ZM21 14.5C21 14.698 20.941 14.891 20.831 15.056C20.722 15.22 20.565 15.348 20.383 15.424C20.2 15.5 19.999 15.519 19.805 15.481C19.611 15.442 19.433 15.347 19.293 15.207C19.153 15.067 19.058 14.889 19.019 14.695C18.981 14.501 19 14.3 19.076 14.117C19.152 13.935 19.28 13.778 19.444 13.669C19.609 13.559 19.802 13.5 20 13.5C20.265 13.5 20.52 13.605 20.707 13.793C20.895 13.98 21 14.235 21 14.5ZM15 22.5C15 22.698 14.941 22.891 14.831 23.056C14.722 23.22 14.565 23.348 14.383 23.424C14.2 23.5 13.999 23.519 13.805 23.481C13.611 23.442 13.433 23.347 13.293 23.207C13.153 23.067 13.058 22.889 13.019 22.695C12.981 22.501 13 22.3 13.076 22.117C13.152 21.935 13.28 21.778 13.444 21.669C13.609 21.559 13.802 21.5 14 21.5C14.265 21.5 14.52 21.605 14.707 21.793C14.895 21.98 15 22.235 15 22.5ZM15 18.5C15 18.698 14.941 18.891 14.831 19.056C14.722 19.22 14.565 19.348 14.383 19.424C14.2 19.5 13.999 19.519 13.805 19.481C13.611 19.442 13.433 19.347 13.293 19.207C13.153 19.067 13.058 18.889 13.019 18.695C12.981 18.501 13 18.3 13.076 18.117C13.152 17.935 13.28 17.778 13.444 17.669C13.609 17.559 13.802 17.5 14 17.5C14.265 17.5 14.52 17.605 14.707 17.793C14.895 17.98 15 18.235 15 18.5ZM15 14.5C15 14.698 14.941 14.891 14.831 15.056C14.722 15.22 14.565 15.348 14.383 15.424C14.2 15.5 13.999 15.519 13.805 15.481C13.611 15.442 13.433 15.347 13.293 15.207C13.153 15.067 13.058 14.889 13.019 14.695C12.981 14.501 13 14.3 13.076 14.117C13.152 13.935 13.28 13.778 13.444 13.669C13.609 13.559 13.802 13.5 14 13.5C14.265 13.5 14.52 13.605 14.707 13.793C14.895 13.98 15 14.235 15 14.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : data.listing.category === "guesthouse" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24.155 8.78099L24.33 8.94499L37.402 21.787L36 23.213L34.2 21.445L34.201 35C34.201 36.054 33.385 36.918 32.35 36.994L32.201 37H12.201C11.147 37 10.283 36.184 10.206 35.149L10.201 35L10.2 21.446L8.402 23.213L7 21.787L20.058 8.95799C21.171 7.82199 22.966 7.75899 24.155 8.78099ZM21.569 10.285L21.473 10.372L12.2 19.481L12.201 35L17.2 34.999L17.201 25C17.201 23.946 18.017 23.082 19.052 23.005L19.201 23H25.201C26.255 23 27.119 23.816 27.196 24.851L27.201 25L27.2 34.999L32.201 35L32.2 19.48L22.901 10.344C22.537 9.98699 21.969 9.96499 21.569 10.285ZM25.201 25H19.201L19.2 34.999H25.2L25.201 25Z"
                  fill="currentColor"
                />
              </svg>
            ) : data.listing.category === "hostel" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 13.5H18V10.5C18.001 9.97 18.212 9.461 18.587 9.086C18.961 8.712 19.47 8.501 20 8.5H34C34.53 8.501 35.039 8.711 35.414 9.086C35.789 9.461 35.999 9.97 36 10.5V34.5C35.999 35.03 35.788 35.539 35.414 35.913C35.039 36.288 34.53 36.499 34 36.5H10C9.47 36.499 8.962 36.288 8.587 35.913C8.212 35.538 8.001 35.03 8 34.5V15.5C8.001 14.97 8.212 14.461 8.587 14.086C8.961 13.712 9.47 13.501 10 13.5ZM25 34.5H29V29.5H25V34.5ZM20 34.5H23V29.5C23.001 28.97 23.212 28.461 23.587 28.087C23.961 27.712 24.47 27.501 25 27.5H29C29.53 27.501 30.039 27.712 30.414 28.087C30.788 28.461 30.999 28.97 31 29.5V34.5H34L34.001 10.5H20V34.5ZM10 34.5H18V15.5H10V34.5ZM23 22.5C23 22.698 23.059 22.891 23.169 23.056C23.278 23.22 23.435 23.348 23.617 23.424C23.8 23.5 24.001 23.519 24.195 23.481C24.389 23.442 24.567 23.347 24.707 23.207C24.847 23.067 24.942 22.889 24.981 22.695C25.019 22.501 25 22.3 24.924 22.117C24.848 21.935 24.72 21.778 24.556 21.669C24.391 21.559 24.198 21.5 24 21.5C23.735 21.5 23.48 21.605 23.293 21.793C23.105 21.98 23 22.235 23 22.5ZM23 18.5C23 18.698 23.059 18.891 23.169 19.056C23.278 19.22 23.435 19.348 23.617 19.424C23.8 19.5 24.001 19.519 24.195 19.481C24.389 19.442 24.567 19.347 24.707 19.207C24.847 19.067 24.942 18.889 24.981 18.695C25.019 18.501 25 18.3 24.924 18.117C24.848 17.935 24.72 17.778 24.556 17.669C24.391 17.559 24.198 17.5 24 17.5C23.735 17.5 23.48 17.605 23.293 17.793C23.105 17.98 23 18.235 23 18.5ZM23 14.5C23 14.698 23.059 14.891 23.169 15.056C23.278 15.22 23.435 15.348 23.617 15.424C23.8 15.5 24.001 15.519 24.195 15.481C24.389 15.442 24.567 15.347 24.707 15.207C24.847 15.067 24.942 14.889 24.981 14.695C25.019 14.501 25 14.3 24.924 14.117C24.848 13.935 24.72 13.778 24.556 13.669C24.391 13.559 24.198 13.5 24 13.5C23.735 13.5 23.48 13.605 23.293 13.793C23.105 13.98 23 14.235 23 14.5ZM29 22.5C29 22.698 29.059 22.891 29.169 23.056C29.278 23.22 29.435 23.348 29.617 23.424C29.8 23.5 30.001 23.519 30.195 23.481C30.389 23.442 30.567 23.347 30.707 23.207C30.847 23.067 30.942 22.889 30.981 22.695C31.019 22.501 31 22.3 30.924 22.117C30.848 21.935 30.72 21.778 30.556 21.669C30.391 21.559 30.198 21.5 30 21.5C29.735 21.5 29.48 21.605 29.293 21.793C29.105 21.98 29 22.235 29 22.5ZM29 18.5C29 18.698 29.059 18.891 29.169 19.056C29.278 19.22 29.435 19.348 29.617 19.424C29.8 19.5 30.001 19.519 30.195 19.481C30.389 19.442 30.567 19.347 30.707 19.207C30.847 19.067 30.942 18.889 30.981 18.695C31.019 18.501 31 18.3 30.924 18.117C30.848 17.935 30.72 17.778 30.556 17.669C30.391 17.559 30.198 17.5 30 17.5C29.735 17.5 29.48 17.605 29.293 17.793C29.105 17.98 29 18.235 29 18.5ZM29 14.5C29 14.698 29.059 14.891 29.169 15.056C29.278 15.22 29.435 15.348 29.617 15.424C29.8 15.5 30.001 15.519 30.195 15.481C30.389 15.442 30.567 15.347 30.707 15.207C30.847 15.067 30.942 14.889 30.981 14.695C31.019 14.501 31 14.3 30.924 14.117C30.848 13.935 30.72 13.778 30.556 13.669C30.391 13.559 30.198 13.5 30 13.5C29.735 13.5 29.48 13.605 29.293 13.793C29.105 13.98 29 14.235 29 14.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : data.listing.category === "bnb" ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27 37H17V35H27V37ZM25 33H19V31H25V33ZM35 8V11H37V13H35V28C35 28.513 34.614 28.936 34.117 28.993L34 29H10C9.487 29 9.064 28.614 9.007 28.117L9 28V13H7V11H33V8H35ZM33 13H11V27H18V19C18 18.487 18.386 18.064 18.883 18.007L19 18H25C25.513 18 25.936 18.386 25.993 18.883L26 19V27H33V13ZM24 20H20V27H24V20ZM30 15C30.552 15 31 15.448 31 16C31 16.552 30.552 17 30 17C29.448 17 29 16.552 29 16C29 15.448 29.448 15 30 15Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <div />
            )}
          </div>
          <p className="capitalize">{data.listing.category}</p>
        </div>
        <h3 className="text-2xl font-medium">Description</h3>
        <p className="mt-2 text-lg text-gray-500">{data.listing.description}</p>
      </div>
      <div className="mt-8">
        <div className="grid max-w-2xl grid-cols-2 divide-x">
          <div>
            <h3 className="text-lg font-medium">Check-in</h3>
            <p className="mt-2 text-gray-500">
              3:00 PM (15:00) 10:00 PM (22:00)
            </p>
          </div>
          <div className="pl-4">
            <h3 className="text-lg font-medium">Checkout</h3>
            <p className="mt-2 text-gray-500">
              11:00 AM (11:00) - 12:00 PM (12:00)
            </p>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-medium">Self check-in</h3>
        <p className="mt-2 text-gray-500">
          Check yourself in with the lockbox.
        </p>
      </div>
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

  const { data: booking } = api.booking.getByUserAndListing.useQuery({
    listingId: data.listing.id,
    userId: user?.id,
  });

  return (
    <>
      <Head>
        <title>{data.listing.title}</title>
      </Head>
      <PageLayout>
        <div>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <h1 className="flex items-center justify-between text-4xl font-semibold">
                {data.listing.title}{" "}
                {booking && (
                  <span
                    className={clsx(
                      "ml-2 inline-flex h-fit items-center rounded-md px-2 py-1 text-sm font-medium capitalize md:text-xl",
                      booking.booking.status === "pending" &&
                        "bg-yellow-100 text-yellow-600",
                      booking.booking.status === "confirmed" &&
                        "bg-green-100 text-green-600",
                      booking.booking.status === "canceled" &&
                        "bg-red-100 text-red-600"
                    )}
                  >
                    {booking.booking.status}
                  </span>
                )}
                {isOwner && (
                  <Link
                    href={`/listing/${data.listing.id}/edit`}
                    className="rounded-full p-2 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-6 w-6" />
                  </Link>
                )}
              </h1>
              <h2 className="text-xl text-gray-500">
                {data.listing.city}, {data.listing.country}
              </h2>
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5" />
              <span className="text-lg font-medium">5.0</span>
            </div>
          </div>
          <ImageGallery data={data} />
          <div className="gap-24 lg:grid lg:grid-cols-11 lg:items-start">
            <DescriptionView data={data} />
            <BookingView data={data} isOwner={isOwner} />
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
