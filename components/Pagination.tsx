"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

interface PaginationProps {
  isNext: boolean;
}

const Pagination = ({ isNext }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const handleNavigation = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? page - 1 : page + 1;

    if (nextPage < 1) return;

    const newUrl =
      nextPage === 1
        ? removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["page"],
          })
        : formUrlQuery({
            params: searchParams.toString(),
            key: "page",
            value: nextPage.toString(),
          });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex-center mt-10 gap-4">
      <Button
        disabled={page <= 1}
        onClick={() => handleNavigation("prev")}
        className="flex-center body-medium gap-2 rounded-lg border px-5 py-3"
      >
        <p>Previous</p>
      </Button>
      <span className="body-semibold primary-text-gradient">{page}</span>
      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="flex-center body-medium gap-2 rounded-lg border px-5 py-3"
      >
        <p>Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
