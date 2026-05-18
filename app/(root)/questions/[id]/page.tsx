import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import React, { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import AllAnswers from "@/components/answers/AllAnswers";
import TagCard from "@/components/cards/TagCard";
import { Preview } from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/AnswerForm";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import { incrementViews, deleteQuestion } from "@/lib/actions/question.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { auth } from "@/auth";
import { hasVoted } from "@/lib/actions/vote.action";
import DeleteButton from "@/components/DeleteButton";
import Votes from "@/components/votes/Votes";
import { getCachedQuestion } from "@/lib/data/questions";
import { getCachedAnswers } from "@/lib/data/answers";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const question = await getCachedQuestion(id);
    return {
      title: `${question.title} — DevFlow`,
      description: question.content?.slice(0, 155),
    };
  } catch {
    return { title: "Question — DevFlow" };
  }
}

async function CachedQuestionView({ id }: { id: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.questions);
  cacheTag(CACHE_TAGS.question(id));

  const question = await getCachedQuestion(id);
  const { author, createdAt, answers, views, tags, content, title } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full break-all">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>
    </>
  );
}

async function AnswersList({
  questionId,
  page,
  pageSize,
  filter,
  userId,
}: {
  questionId: string;
  page: number;
  pageSize: number;
  filter?: string;
  userId?: string;
}) {
  const { answers, isNext, totalAnswers } = await getCachedAnswers({
    questionId,
    page,
    pageSize,
    filter,
  });

  return (
    <AllAnswers
      data={answers}
      success={true}
      totalAnswers={totalAnswers}
      isNext={isNext}
      userId={userId}
    />
  );
}

async function QuestionDetailContent({
  params,
  searchParams,
}: RouteParams) {
  const { id } = await params;
  const { page, pageSize, filter } = await searchParams;
  const session: AppSession | null = (await auth()) as AppSession | null;

  after(async () => {
    await incrementViews({ questionId: id });
  });

  let question: Question;
  try {
    question = await getCachedQuestion(id);
  } catch {
    return redirect("/404");
  }

  const hasVotedPromise = hasVoted({
    targetId: question._id,
    targetType: "question",
  });

  const isOwner = session?.user?.id === question.author._id;

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-2">
        {isOwner && (
          <>
            <Link
              href={ROUTES.EDIT_QUESTION(question._id)}
              className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
            >
              <Image src="/icons/edit.svg" alt="edit" width={14} height={14} />
              Edit
            </Link>
            <DeleteButton
              itemId={question._id}
              deleteAction={deleteQuestion}
              redirectUrl={ROUTES.HOME}
            />
          </>
        )}

        <Suspense fallback={<div>Loading...</div>}>
          <Votes
            targetType="question"
            upvotes={question.upvotes}
            downvotes={question.downvotes}
            targetId={question._id}
            hasVotedPromise={hasVotedPromise}
            session={session}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-light-800 dark:bg-dark-300 rounded-[10px]" />}>
        <CachedQuestionView id={id} />
      </Suspense>

      <section className="my-5">
        <Suspense fallback={<div className="animate-pulse space-y-4 mt-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-light-800 dark:bg-dark-300 rounded-[10px]" />)}</div>}>
          <AnswersList questionId={id} page={Number(page) || 1} pageSize={Number(pageSize) || 10} filter={filter} userId={session?.user?.id} />
        </Suspense>
      </section>

      <section className="my-5">
        <AnswerForm questionId={question._id} session={session} />
      </section>
    </>
  );
}

const QuestionDetails = ({ params, searchParams }: RouteParams) => {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6">{[1,2,3].map(i => <div key={i} className="h-48 bg-light-800 dark:bg-dark-300 rounded-[10px]" />)}</div>}>
      <QuestionDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
};

export default QuestionDetails;
