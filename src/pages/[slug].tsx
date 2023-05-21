import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Header from "~/components/header";
import { api } from "~/utils/api";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const id = props.slug;
  const { data } = api.profile.getUserById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

  console.log(id);

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>
      <Header />
      <PageLayout>
        <div>{data.name}</div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import PageLayout from "~/components/layout";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
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
