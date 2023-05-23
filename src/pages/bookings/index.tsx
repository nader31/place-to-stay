import PageLayout from "~/components/layout";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import { toast } from "react-hot-toast";

type SingleBooking = RouterOutputs["booking"]["getByListingAuthor"][number];

const BookingPreview = (props: { data: SingleBooking }) => {
  const { data } = props;
  const listing = data.listing;
  if (!listing) return <div />;

  return (
    <Link
      href={`/listing/${listing.id}`}
      key={listing.id}
      className="my-5 flex gap-3 overflow-hidden rounded-xl"
    >
      {listing.images && listing.images.length > 0 && listing.images[0] ? (
        <Image
          src={listing.images[0].url}
          alt="Listing image"
          className="h-24 w-24 rounded-xl object-cover"
          width={96}
          height={96}
        />
      ) : (
        <div className="h-24 w-24 rounded-xl bg-gray-100"></div>
      )}
      <div className="overflow-hidden p-2">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
          {listing.city}, {listing.country}
        </p>
        <p className="text-sm text-gray-400 line-clamp-3">{listing.title}</p>
      </div>
    </Link>
  );
};

export default function Bookings() {
  const { user } = useUser();

  if (!user) return <div />;

  const ctx = api.useContext();

  const { mutate, isLoading: isUpdating } =
    api.booking.updateBookingStatus.useMutation({
      onSuccess: () => {
        toast.success("Booking updated");
        void ctx.booking.getByListingAuthor.invalidate({
          listingAuthorId: user?.id,
        });
      },
      onError: () => {
        toast.error("Error updating booking");
      },
    });

  const { data, isLoading } = api.booking.getByListingAuthor.useQuery({
    listingAuthorId: user?.id,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div />;

  const handleAccept = (bookingId: string) => {
    mutate({ bookingId, status: "confirmed" });
  };

  const handleDecline = (bookingId: string) => {
    mutate({ bookingId, status: "canceled" });
  };

  return (
    <PageLayout>
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {data.map((booking) => (
          <div key={booking.id} className="rounded-3xl border p-4">
            <div className="flex justify-end">
              <p className="text-xs font-light text-gray-500">
                {moment(booking.createdAt).fromNow()}
              </p>
            </div>
            {booking.user && (
              <Link
                href={`/${booking.user.id}`}
                className="mt-2 flex flex-col items-center gap-3"
              >
                <Image
                  src={booking.user.profileImageURL}
                  className="h-16 w-16 rounded-full"
                  alt="Profile image"
                  width={64}
                  height={64}
                />
                <p className="text-2xl font-bold">{booking.user.name}</p>
              </Link>
            )}
            <BookingPreview data={booking} />
            <div>
              <p className="text-lg">
                <span className="font-medium">
                  {moment(booking.startDate).format("DD/MM/YYYY")}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {moment(booking.endDate).format("DD/MM/YYYY")}
                </span>
              </p>
            </div>
            <div className="mt-2 flex justify-between">
              <p>{booking.nights} nights</p>
              <p className="font-bold">
                {booking.listing.price * booking.nights}€
              </p>
            </div>

            {booking.status === "confirmed" ? (
              <div className="mt-8 flex w-full items-center justify-center rounded-lg bg-green-500 px-4 py-3 font-medium text-white">
                <p>Confirmed</p>
              </div>
            ) : booking.status === "canceled" ? (
              <div className="mt-8 flex w-full items-center justify-center rounded-lg bg-gray-300 px-4 py-3 font-medium">
                <p>Canceled</p>
              </div>
            ) : (
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => handleDecline(booking.id)}
                  className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAccept(booking.id)}
                  className="flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white hover:bg-black"
                  disabled={isUpdating}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
