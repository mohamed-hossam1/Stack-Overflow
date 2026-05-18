import Link from "next/link";
import { Suspense } from "react";

import ROUTES from "@/constants/routes";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { hasVoted } from "@/lib/actions/vote.action";
import { getTimeStamp } from "@/lib/utils";

import { Preview } from "../editor/Preview";
import UserAvatar from "../UserAvatar";
import Votes from "../votes/Votes";
import DeleteButton from "../DeleteButton";

const AnswerCard = async ({
  _id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  userId,
}: Answer & { userId?: string }) => {
  const hasVotedPromise = hasVoted({
    targetId: _id,
    targetType: "answer",
  });

  const session: AppSession | null = userId
    ? ({ user: { id: userId } } as AppSession)
    : null;

  return (
    <article className="light-border border-b py-10">
      <span id={JSON.stringify(_id)} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link
            href={ROUTES.PROFILE(author._id)}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? "Anonymous"}
            </p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(createdAt)}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              targetType="answer"
              targetId={_id}
              hasVotedPromise={hasVotedPromise}
              upvotes={upvotes}
              downvotes={downvotes}
              session={session}
            />
          </Suspense>
        </div>
      </div>

      <Preview content={content} />

      {session?.user?.id === author._id && (
        <div className="mt-4 flex justify-end">
          <DeleteButton itemId={_id} paramKey="answerId" deleteAction={deleteAnswer} />
        </div>
      )}
    </article>
  );
};

export default AnswerCard;
