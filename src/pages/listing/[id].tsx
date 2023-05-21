import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import React from "react";
import PageLayout from "~/components/layout";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { api } from "~/utils/api";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const SingleListingPage: NextPage<PageProps> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data } = api.listings.getById.useQuery({
    id: props.id,
  });

  if (!data) return <div />;

  return (
    <>
      <Head>
        <title>Listing</title>
      </Head>
      <PageLayout>
        <div>
          <h1 className="text-4xl font-semibold">{data.title}</h1>
          <div className="mt-2 flex gap-3">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5" />
              <span className="font-medium">4.5</span>
            </div>
          </div>
          <div className="my-10 w-full overflow-hidden rounded-2xl">
            {data.images && data.images[0] && (
              <div className="grid grid-cols-2 gap-2">
                <Image
                  src={data.images[0].url}
                  alt={data.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
                <div className="grid grid-cols-2 gap-2">
                  {data.images.slice(1, 5).map((image) => (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt={data.title}
                      width={500}
                      height={500}
                      className="h-full w-full object-cover"
                    />
                  ))}
                  {data.images.length === 3 && (
                    <div className="h-full w-full bg-gray-200"></div>
                  )}
                  <div className="h-full w-full bg-gray-200"></div>
                </div>
              </div>
            )}
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
