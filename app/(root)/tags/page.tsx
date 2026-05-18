import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_TAGS } from "@/constants/states";
import CommonFilter from "@/components/filters/CommonFilter";
import { TagFilters } from "@/constants/filters";
import Pagination from "@/components/Pagination";
import SuspenseOnSearchParams from "@/components/SuspenseOnSearchParams";
import { getCachedTags } from "@/lib/data/tags";
import { CACHE_TAGS } from "@/lib/cache/tags";

export const metadata: Metadata = {
  title: "Tags — DevFlow",
};

async function CachedTagsList({
  page,
  pageSize,
  query,
  filter,
}: {
  page: number;
  pageSize: number;
  query?: string;
  filter?: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.tags);

  const { tags, isNext } = await getCachedTags({ page, pageSize, query, filter });

  return (
    <>
      <DataRenderer
        success={true}
        data={tags}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 flex w-full flex-wrap gap-4 min-h-[445px]">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />
      <Pagination isNext={isNext} />
    </>
  );
}

async function TagsListWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { page, pageSize, query, filter } = await searchParams;
  return (
    <CachedTagsList
      page={Number(page) || 1}
      pageSize={Number(pageSize) || 10}
      query={query}
      filter={filter}
    />
  );
}

const tagsGridSkeleton = (
  <div className="animate-pulse mt-10">
    <div className="flex flex-wrap gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="card-wrapper rounded-[10px] p-9 h-36 w-[260px] bg-light-800 dark:bg-dark-300"
        />
      ))}
    </div>
  </div>
);

const Tags = ({ searchParams }: { searchParams: Promise<Record<string, string>> }) => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
        />
      </div>
      <CommonFilter
        filters={TagFilters}
        otherClasses="min-h-[40px] sm:min-w-[70px] mt-5"
      />

      <SuspenseOnSearchParams fallback={tagsGridSkeleton}>
        <TagsListWrapper searchParams={searchParams} />
      </SuspenseOnSearchParams>
    </>
  );
};

export default Tags;
