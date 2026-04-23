import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { UserFilters } from "@/constants/filters";
import { EMPTY_USERS } from "@/constants/states";
import Pagination from "@/components/Pagination";
import SuspenseOnSearchParams from "@/components/SuspenseOnSearchParams";
import { getCachedUsers } from "@/lib/data/users";
import { CACHE_TAGS } from "@/lib/cache/tags";

export const metadata: Metadata = {
  title: "Community — DevFlow",
};

async function CachedUsersList({
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
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.users);

  const { users, isNext } = await getCachedUsers({ page, pageSize, query, filter });

  return (
    <>
      <DataRenderer
        success={true}
        data={users}
        empty={EMPTY_USERS}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />
      <Pagination isNext={isNext} />
    </>
  );
}

async function UsersListWrapper({ searchParams }: RouteParams) {
  const { page, pageSize, query, filter } = await searchParams;
  return (
    <CachedUsersList
      page={Number(page) || 1}
      pageSize={Number(pageSize) || 10}
      query={query}
      filter={filter}
    />
  );
}

const usersGridSkeleton = (
  <div className="animate-pulse mt-10">
    <div className="flex flex-wrap gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="card-wrapper rounded-[10px] p-9 h-44 w-[260px] bg-light-800 dark:bg-dark-300"
        />
      ))}
    </div>
  </div>
);

const Community = ({ searchParams }: RouteParams) => {
  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="There are some great devs here!"
          otherClasses="flex-1"
        />
      </div>

      <CommonFilter
        filters={UserFilters}
        otherClasses="min-h-[40px] sm:min-w-[70px] mt-5"
      />

      <SuspenseOnSearchParams fallback={usersGridSkeleton}>
        <UsersListWrapper searchParams={searchParams} />
      </SuspenseOnSearchParams>
    </div>
  );
};

export default Community;
