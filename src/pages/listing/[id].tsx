import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import PageLayout from "~/components/layout";

const SingleListingPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Listing</title>
      </Head>
      <PageLayout>
        <div>Listing View</div>
      </PageLayout>
    </>
  );
};

export default SingleListingPage;
