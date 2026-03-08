import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Metric from "@/components/Metric";
import Pagination from "@/components/Pagination";
import TagCard from "@/components/cards/TagCard";
import UserAvatar from "@/components/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMPTY_ANSWERS, EMPTY_QUESTION } from "@/constants/states";
import { getUserAnswers } from "@/lib/actions/answer.action";
import { getUserQuestions } from "@/lib/actions/question.action";
import { getUserTopTags } from "@/lib/actions/tag.action";
import { getUser } from "@/lib/actions/user.action";
import { getTimeStamp } from "@/lib/utils";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const { success, data: user } = await getUser({ userId: id });

  if (!success || !user) {
    return { title: "Profile — DevFlow" };
  }

  return { title: `${user.name} — DevFlow` };
}

const ProfilePage = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize } = await searchParams;

  const { success, data: user } = await getUser({ userId: id });
  const session: AppSession | null = await auth() as AppSession | null;

  if (!success || !user) return redirect("/404");

  const {
    _id,
    name,
    username,
    image,
    bio,
    location,
    portfolio,
    reputation,
    createdAt,
  } = user;

  const isOwner = session?.user?.id === _id;

  const { success: qSuccess, data: qData } = await getUserQuestions({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { success: aSuccess, data: aData } = await getUserAnswers({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { success: tSuccess, data: tData } = await getUserTopTags({
    userId: id,
  });

  return (
    <div className="flex-start w-full flex-col">
      <div className="flex w-full flex-col-reverse justify-between sm:flex-row">
        <div className="flex items-center justify-start gap-4">
          <UserAvatar
            id={_id}
            name={name}
            imageUrl={image}
            className="size-[140px]"
            fallbackClassName="text-4xl"
          />

          <div>
            <h1 className="h1-bold text-dark300_light700">{name}</h1>
            <p className="paragraph-regular text-dark400_light800">
              @{username}
            </p>

            {bio && (
              <p className="body-regular text-dark400_light800 mt-2">{bio}</p>
            )}

            {location && (
              <p className="body-regular text-dark400_light800 mt-1 flex items-center gap-1">
                {location}
              </p>
            )}

            {portfolio && (
              <Link
                href={portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="body-regular text-primary-500 mt-1 inline-block"
              >
                {portfolio}
              </Link>
            )}

            <div className="mt-2 flex items-center gap-4">
              <Metric
                imgUrl="/icons/star.svg"
                alt="Reputation"
                value={reputation ?? 0}
                title="reputation"
                textStyles="small-regular text-dark400_light700"
              />
              <Metric
                imgUrl="/icons/clock.svg"
                alt="Joined"
                value={`Joined ${getTimeStamp(new Date(createdAt))}`}
                title=""
                textStyles="small-regular text-dark400_light700"
              />
            </div>
          </div>
        </div>

        {isOwner && (
          <Link
            href={`/profile/${_id}/edit`}
            className="primary-gradient btn mb-4 mt-4 h-10 rounded-lg px-6 py-2 text-light-900"
          >
            Edit Profile
          </Link>
        )}
      </div>

      <section className="mt-10 w-full">
        <Tabs defaultValue="questions">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="questions" className="tab">
              Questions
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
            <TabsTrigger value="tags" className="tab">
              Top Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-5 w-full">
            <DataRenderer
              success={qSuccess}
              data={qData?.questions}
              empty={EMPTY_QUESTION}
              render={(questions) => (
                <div className="flex w-full flex-col gap-6">
                  {questions.map((q) => (
                    <QuestionCard key={q._id} question={q} session={session} />
                  ))}
                </div>
              )}
            />
            <Pagination isNext={qData?.isNext || false} />
          </TabsContent>

          <TabsContent value="answers" className="mt-5 w-full">
            <DataRenderer
              success={aSuccess}
              data={aData?.answers}
              empty={EMPTY_ANSWERS}
              render={(answers) => (
                <div className="flex w-full flex-col gap-6">
                  {answers.map((answer) => (
                    <div
                      key={answer._id}
                      className="light-border border-b py-4"
                    >
                      <Link
                        href={`/questions/${answer.question}`}
                        className="body-semibold text-primary-500"
                      >
                        {answer.content?.substring(0, 200)}...
                      </Link>
                      <p className="small-regular text-dark400_light700 mt-1">
                        {getTimeStamp(answer.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            />
            <Pagination isNext={aData?.isNext || false} />
          </TabsContent>

          <TabsContent value="tags" className="mt-5 w-full">
            <DataRenderer
              success={tSuccess}
              data={tData}
              empty={EMPTY_QUESTION}
              render={(tags) => (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: Tag) => (
                    <TagCard
                      key={tag._id}
                      _id={tag._id}
                      name={tag.name}
                      questions={tag.questions}
                      compact
                      showCount
                    />
                  ))}
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default ProfilePage;
