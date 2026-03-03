"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

interface Filter {
  name: string;
  value: string;
}

interface Props {
  filters: Filter[];
  otherClasses?: string;
  containerClasses?: string;
}

const CommonFilter = ({
  filters,
  otherClasses = "",
  containerClasses = "",
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsFilter = searchParams.get("filter");
  const activeFilter = paramsFilter || filters[0]?.value;

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-3 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1",
        containerClasses,
      )}
    >
      {filters.map((item) => {
        const isActive = activeFilter === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => handleUpdateParams(item.value)}
            aria-pressed={isActive}
            className={cn(
              "subtle-medium background-light800_dark300 text-light400_light500 rounded-full px-4 py-2 uppercase transition-colors hover:background-light700_dark400",
              isActive && "background-light700_dark400 text-dark300_light900",
              otherClasses,
            )}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
};

export default CommonFilter;
