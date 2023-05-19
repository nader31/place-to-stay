import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();
  const { signOut } = useClerk();

  const { data } = api.listing.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {!user.isSignedIn && <SignInButton />}
          {user.isSignedIn && (
            <button onClick={() => signOut()}>Sign out</button>
          )}
        </div>
        <div>
          {data?.map((listing) => (
            <div key={listing.id}>
              <p>{listing.title}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
