import type { Metadata } from "next";
import Link from "next/link";

import ROUTES from "@/constants/routes";

export const metadata: Metadata = {
  title: "404 — Page Not Found | DevFlow",
  description: "The page you are looking for does not exist.",
};

const NotFound = () => {
  return (
    <div className="flex-center min-h-[calc(100vh-200px)] w-full flex-col gap-6 text-center">
      <h1 className="primary-text-gradient text-[120px] font-bold leading-none tracking-tighter sm:text-[160px]">
        404
      </h1>

      <h2 className="h2-bold text-dark100_light900">Page Not Found</h2>

      <p className="body-regular text-dark500_light700 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved. Let&apos;s get you back on track.
      </p>

      <Link
        href={ROUTES.HOME}
        className="primary-gradient mt-2 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-light-900 shadow-md transition-opacity hover:opacity-90"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
