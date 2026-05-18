import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { HomePageFilters } from "@/constants/filters";
import Pagination from "@/components/Pagination";
import SuspenseOnSearchParams from "@/components/SuspenseOnSearchParams";
import { getCachedQuestions } from "@/lib/data/questions";
import { CACHE_TAGS } from "@/lib/cache/tags";

export const metadata: Metadata = {
  title: "Home — DevFlow",
};

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

async function CachedQuestionsList({
  page,
  pageSize,
  query,
  filter,
  session,
}: {
  page: number;
  pageSize: number;
  query: string;
  filter: string;
  session: AppSession | null;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.questions);

  const { questions, isNext } = await getCachedQuestions({ page, pageSize, query, filter });

  return (
    <>
      <DataRenderer
        success={true}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6 min-h-[440px]">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} session={session} />
            ))}
          </div>
        )}
      />
      <Pagination isNext={isNext} />
    </>
  );
}

async function QuestionsListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { page, pageSize, query, filter } = await searchParams;
  const session = (await auth()) as AppSession | null;
  return (
    <CachedQuestionsList
      page={Number(page) || 1}
      pageSize={Number(pageSize) || 10}
      query={query || ""}
      filter={filter || ""}
      session={session}
    />
  );
}

const questionsListSkeleton = (
  <div className="animate-pulse space-y-6 mt-10">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="card-wrapper rounded-[10px] p-9 h-48 bg-light-800 dark:bg-dark-300"
      />
    ))}
  </div>
);

const Home = ({ searchParams }: SearchParams) => {
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 text-light-900!"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter
        filters={HomePageFilters}
        containerClasses="max-sm:hidden min-h-[40px] sm:min-w-[70px] mt-5"
      />

      <SuspenseOnSearchParams fallback={questionsListSkeleton}>
        <QuestionsListWrapper searchParams={searchParams} />
      </SuspenseOnSearchParams>
    </>
  );
};

export default Home;
