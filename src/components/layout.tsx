import type { PropsWithChildren } from "react";
import Header from "./header";

export default function PageLayout(props: PropsWithChildren) {
  return (
    <div>
      <Header />
      <main className="flex w-full justify-center">
        <div className="px-6 py-6 sm:px-6 md:max-w-7xl xl:px-0">
          {props.children}
        </div>
      </main>
    </div>
  );
}
