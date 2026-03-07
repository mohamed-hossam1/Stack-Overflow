import React from "react";

import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import Pagination from "@/components/Pagination";
import { CollectionFilters } from "@/constants/filters";
import { EMPTY_COLLECTIONS } from "@/constants/states";
import { getUserCollections } from "@/lib/actions/collection.action";

const CollectionsPage = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getUserCollections({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { questions, isNext } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Collections</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search collections..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={CollectionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_COLLECTIONS}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination isNext={isNext || false} />
    </>
  );
};

export default CollectionsPage;
