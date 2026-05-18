import { ReactNode, Suspense } from "react";

import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import RightSidebar from "@/components/navigation/RightSidebar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="background-light850_dark100 realtive">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <div className="flex">
        <Suspense fallback={null}>
          <LeftSidebar />
        </Suspense>

        <section className="flex min-h-screen flex-1 min-w-0 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full">{children}</div>
        </section>

        <Suspense fallback={null}>
          <RightSidebar />
        </Suspense>
      </div>
    </main>
  );
};

export default RootLayout;
