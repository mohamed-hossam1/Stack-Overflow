"use client";

import Image from "next/image";
import { use, useState } from "react";

import { createVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface Params {
  targetType: "question" | "answer";
  targetId: string;
  upvotes: number;
  downvotes: number;
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
  session: AppSession | null;
}

const Votes = ({
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  hasVotedPromise,
  targetId,
  targetType,
  session,
}: Params) => {
  const userId = session?.user?.id;

  const { success, data } = use(hasVotedPromise);

  const [localUpvotes, setLocalUpvotes] = useState(initialUpvotes);
  const [localDownvotes, setLocalDownvotes] = useState(initialDownvotes);
  const [localHasUpvoted, setLocalHasUpvoted] = useState(
    data?.hasUpvoted ?? false
  );
  const [localHasDownvoted, setLocalHasDownvoted] = useState(
    data?.hasDownvoted ?? false
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId)
      return toast("Please login to vote", {
        description: "Only logged-in users can vote.",
      });

    const snapshot = {
      upvotes: localUpvotes,
      downvotes: localDownvotes,
      hasUpvoted: localHasUpvoted,
      hasDownvoted: localHasDownvoted,
    };

    if (voteType === "upvote") {
      if (localHasUpvoted) {
        setLocalUpvotes((v) => v - 1);
        setLocalHasUpvoted(false);
      } else {
        setLocalUpvotes((v) => v + 1);
        setLocalHasUpvoted(true);
        if (localHasDownvoted) {
          setLocalDownvotes((v) => v - 1);
          setLocalHasDownvoted(false);
        }
      }
    } else {
      if (localHasDownvoted) {
        setLocalDownvotes((v) => v - 1);
        setLocalHasDownvoted(false);
      } else {
        setLocalDownvotes((v) => v + 1);
        setLocalHasDownvoted(true);
        if (localHasUpvoted) {
          setLocalUpvotes((v) => v - 1);
          setLocalHasUpvoted(false);
        }
      }
    }

    setIsLoading(true);

    try {
      const result = await createVote({
        targetId,
        targetType,
        voteType,
      });

      if (!result.success) {
        setLocalUpvotes(snapshot.upvotes);
        setLocalDownvotes(snapshot.downvotes);
        setLocalHasUpvoted(snapshot.hasUpvoted);
        setLocalHasDownvoted(snapshot.hasDownvoted);

        return toast("Failed to vote", {
          description: result.error?.message,
        });
      }

      if (result.data) {
        setLocalUpvotes(result.data.upvotes);
        setLocalDownvotes(result.data.downvotes);
        setLocalHasUpvoted(result.data.hasUpvoted);
        setLocalHasDownvoted(result.data.hasDownvoted);
      }
    } catch {
      setLocalUpvotes(snapshot.upvotes);
      setLocalDownvotes(snapshot.downvotes);
      setLocalHasUpvoted(snapshot.hasUpvoted);
      setLocalHasDownvoted(snapshot.hasDownvoted);

      toast("Failed to vote", {
        description:
          "An error occurred while voting. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <button
          onClick={() => handleVote("upvote")}
          disabled={isLoading}
          aria-label={`Upvote. Current upvotes: ${formatNumber(localUpvotes)}`}
          aria-pressed={success && localHasUpvoted}
          className={`cursor-pointer bg-transparent border-none p-0 ${isLoading && "opacity-50"}`}
        >
          <Image
            src={
              success && localHasUpvoted
                ? "/icons/upvoted.svg"
                : "/icons/upvote.svg"
            }
            width={18}
            height={18}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(localUpvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <button
          onClick={() => handleVote("downvote")}
          disabled={isLoading}
          aria-label={`Downvote. Current downvotes: ${formatNumber(localDownvotes)}`}
          aria-pressed={success && localHasDownvoted}
          className={`cursor-pointer bg-transparent border-none p-0 ${isLoading && "opacity-50"}`}
        >
          <Image
            src={
              success && localHasDownvoted
                ? "/icons/downvoted.svg"
                : "/icons/downvote.svg"
            }
            width={18}
            height={18}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(localDownvotes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
