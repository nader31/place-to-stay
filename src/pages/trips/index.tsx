import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import React from "react";
import PageLayout from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";

const TripsView = () => {
  const { user } = useUser();

  const { data, isLoading: listingsLoading } = api.booking.getByUser.useQuery({
    userId: user?.id || "",
  });

  if (listingsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  if (data.length === 0) return <div />;

  return (
    <>
      <h3 className="mb-5 font-medium">Upcoming Trips</h3>
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {data.map((booking) => {
          const listing = booking.booking.listing;
          return (
            <Link
              href={`/listing/${listing.id}`}
              key={listing.id}
              className="overflow-hidden"
            >
              {listing.images &&
              listing.images.length > 0 &&
              listing.images[0] ? (
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
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-sm font-medium">
                    {moment(booking.booking.startDate).format("DD/MM/YYYY")} -{" "}
                    {moment(booking.booking.endDate).format("DD/MM/YYYY")}
                  </p>
                  <p className="text-sm font-medium">{booking.nights} nights</p>
                </div>
              </div>
              <div className="mt-3">
                {booking.booking.status === "confirmed" ? (
                  <div className="rounded-xl bg-green-100 py-3 text-center">
                    <p className="text-sm text-green-600">Confirmed</p>
                  </div>
                ) : booking.booking.status === "canceled" ? (
                  <div className="rounded-xl bg-red-100 py-3 text-center">
                    <p className="text-sm text-red-600">Confirmed</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-yellow-100 py-3 text-center">
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default function Trips() {
  return (
    <>
      <Head>
        <title>My Trips</title>
      </Head>
      <PageLayout>
        <TripsView />
      </PageLayout>
    </>
  );
}
