import type { PropsWithChildren } from "react";
import Header from "./header";
import { useUser } from "@clerk/nextjs";
import Footer from "./footer";

export default function PageLayout(props: PropsWithChildren) {
  const { isLoaded: userLoaded } = useUser();

  if (!userLoaded) return <div />;

  return (
    <div>
      <Header />
      <main className="mx-auto min-h-screen px-6 py-6 sm:px-6 md:max-w-7xl xl:px-0">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}
