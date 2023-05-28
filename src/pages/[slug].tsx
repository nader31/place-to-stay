import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";

const UserStats = (props: { userId: string }) => {
  const { data, isLoading: listingsLoading } =
    api.listings.getAllByUser.useQuery({ userId: props.userId });

  const { data: bookingsData, isLoading: bookingsLoading } =
    api.booking.getBookingCountByUser.useQuery({
      userId: props.userId,
    });

  if (listingsLoading || bookingsLoading)
    return (
      <div className="my-10 flex w-full justify-center">
        <div className="flex w-full max-w-lg divide-x rounded-2xl bg-gray-50">
          <div className="flex w-full flex-col items-center py-7">
            <LoadingSpinner size={25} />
          </div>
          <div className="px-auto flex w-full flex-col items-center py-7">
            <LoadingSpinner size={25} />
          </div>
          <div className="px-auto flex w-full flex-col items-center py-7">
            <LoadingSpinner size={25} />
          </div>
        </div>
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  const cities = data.map((fullListing) => fullListing.listing.city);
  const cityCounts = cities.reduce((acc, curr) => {
    if (acc[curr || ""]) acc[curr || ""]++;
    else acc[curr || ""] = 1;
    return acc;
  }, {} as Record<string, number>);

  if (cities.length === 0) return <div />;

  const mostListingsCity = Object.entries(cityCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return (
    <>
      <div className="my-10 flex w-full justify-center">
        <div className="flex w-full max-w-lg divide-x rounded-2xl bg-gray-50">
          <div className="flex w-full flex-col py-3 text-center">
            <h4 className="text-3xl font-medium">{data.length}</h4>
            <p className="text-sm text-gray-500">Listings</p>
          </div>
          <div className="flex w-full flex-col py-3 text-center">
            <h4 className="text-3xl font-medium">{bookingsData}</h4>
            <p className="text-sm text-gray-500">Bookings</p>
          </div>
          <div className="px-auto flex w-full flex-col py-3 text-center">
            <h4 className="text-3xl font-medium">{mostListingsCity[0]}</h4>
            <p className="text-sm text-gray-500">Favorite city</p>
          </div>
        </div>
      </div>
    </>
  );
};

const UserListingView = (props: { userId: string }) => {
  const { data, isLoading: listingsLoading } =
    api.listings.getAllByUser.useQuery({ userId: props.userId });

  if (listingsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  if (data.length === 0) return <div />;

  return (
    <>
      <h3 className="mb-5 font-medium">User&apos;s Listings</h3>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {data.map((fullListing) => (
          <ListingView {...fullListing} key={fullListing.listing.id} />
        ))}
      </div>
    </>
  );
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const id = props.slug;
  const { data } = api.profile.getUserById.useQuery({
    id,
  });

  if (!data)
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div className="text-center">
          <p className="text-base font-semibold text-rose-600">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-rose-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
    );

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>
      <PageLayout>
        <div>
          <Image
            src={data.profileImageURL}
            alt="Profile image"
            width={200}
            height={200}
            className="mx-auto flex rounded-full"
          />
          <h2 className="mb-1 mt-5 text-center text-2xl font-bold">
            {data.name}
          </h2>
          <div className="mb-5 flex w-full justify-center">
            <div className="flex items-center gap-1">
              <StarIcon className="h-5 w-5" />
              <span className="text-lg font-medium">5.0</span>
            </div>
          </div>
          <UserStats userId={data.id} />
          <UserListingView userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import PageLayout from "~/components/layout";
import Link from "next/link";
import Image from "next/image";
import { ListingView } from ".";
import { StarIcon } from "@heroicons/react/24/solid";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug as string;

  await helpers.profile.getUserById.prefetch({ id: slug });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      slug,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
