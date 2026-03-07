"use server";

import { ClientSession } from "mongoose";

import { Answer, Question, User } from "@/database";

export async function updateReputation(
  params: {
    targetId: string;
    targetType: "question" | "answer";
    voteType: "upvote" | "downvote";
    change: 1 | -1;
  },
  session: ClientSession
): Promise<void> {
  const { targetId, targetType, voteType, change } = params;

  const Model = targetType === "question" ? Question : Answer;
  const content = await Model.findById(targetId).session(session);

  if (!content || !content.author) return;

  const authorId = content.author.toString();

  const delta = voteType === "upvote" ? 10 : -2;
  const netChange = delta * change;

  const user = await User.findById(authorId).session(session);
  if (!user) return;

  const newReputation = Math.max(0, (user.reputation || 0) + netChange);

  await User.findByIdAndUpdate(
    authorId,
    { $set: { reputation: newReputation } },
    { session }
  );
}
