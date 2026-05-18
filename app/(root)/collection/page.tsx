import type { Metadata } from "next";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import Pagination from "@/components/Pagination";
import SuspenseOnSearchParams from "@/components/SuspenseOnSearchParams";
import { CollectionFilters } from "@/constants/filters";
import { EMPTY_COLLECTIONS } from "@/constants/states";
import { getUserCollections } from "@/lib/actions/collection.action";

export const metadata: Metadata = {
  title: "Collection — DevFlow",
};

async function CollectionList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { page, pageSize, query } = await searchParams;
  const session = (await auth()) as AppSession | null;

  const { success, data, error } = await getUserCollections({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { questions, isNext } = data || {};

  return (
    <>
      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_COLLECTIONS}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6 min-h-[447px]">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} userId={session?.user?.id} saved />
            ))}
          </div>
        )}
      />
      <Pagination isNext={isNext || false} />
    </>
  );
}

const collectionSkeleton = (
  <div className="animate-pulse mt-10 flex w-full flex-col gap-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="card-wrapper rounded-[10px] p-9 h-48 bg-light-800 dark:bg-dark-300"
      />
    ))}
  </div>
);

const CollectionsPage = ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Collections</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="Search your saved questions..."
          otherClasses="flex-1"
        />
      </div>

      <CommonFilter
        filters={CollectionFilters}
        otherClasses="min-h-[40px] sm:min-w-[70px] mt-5"
      />

      <SuspenseOnSearchParams fallback={collectionSkeleton}>
        <CollectionList searchParams={searchParams} />
      </SuspenseOnSearchParams>
    </div>
  );
};

export default CollectionsPage;
