import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_QUESTION } from "@/constants/states";
import Pagination from "@/components/Pagination";
import SuspenseOnSearchParams from "@/components/SuspenseOnSearchParams";
import { getCachedTagQuestions } from "@/lib/data/tags";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const { tag } = await getCachedTagQuestions({ tagId: id, page: 1, pageSize: 1 });
    return { title: `${tag.name} — DevFlow` };
  } catch {
    return { title: "Tag — DevFlow" };
  }
}

async function CachedTagQuestions({
  tagId,
  page,
  pageSize,
  query,
  session,
}: {
  tagId: string;
  page: number;
  pageSize: number;
  query?: string;
  session: AppSession | null;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.tags);
  cacheTag(CACHE_TAGS.questions);

  const { tag, questions, isNext } = await getCachedTagQuestions({ tagId, page, pageSize, query });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900 mt-5">{tag?.name}</h1>
      </section>

      <DataRenderer
        success={true}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6 min-h-[480px] ">
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

async function TagQuestionsWrapper({ params, searchParams }: RouteParams) {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;
  const session = (await auth()) as AppSession | null;
  return (
    <CachedTagQuestions
      tagId={id}
      page={Number(page) || 1}
      pageSize={Number(pageSize) || 10}
      query={query}
      session={session}
    />
  );
}

const tagQuestionsSkeleton = (
  <div className="animate-pulse space-y-6 mt-10">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="card-wrapper rounded-[10px] p-9 h-48 bg-light-800 dark:bg-dark-300"
      />
    ))}
  </div>
);

const Page = ({ params, searchParams }: RouteParams) => {
  return (
    <>
      <section className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>

      <SuspenseOnSearchParams fallback={tagQuestionsSkeleton}>
        <TagQuestionsWrapper params={params} searchParams={searchParams} />
      </SuspenseOnSearchParams>
    </>
  );
};

export default Page;
