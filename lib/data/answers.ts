import { cacheLife, cacheTag } from "next/cache";

import Answer from "@/database/answer.model";
import { CACHE_TAGS } from "@/lib/cache/tags";
import dbConnect from "@/lib/mongoose";

export async function getCachedAnswers({
  questionId,
  page = 1,
  pageSize = 10,
  filter,
}: {
  questionId: string;
  page: number;
  pageSize: number;
  filter?: string;
}): Promise<{ answers: Answer[]; isNext: boolean; totalAnswers: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.answers);
  cacheTag(CACHE_TAGS.questionAnswers(questionId));

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  let sortCriteria = {};
  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }

  const totalAnswers = await Answer.countDocuments({ question: questionId });
  const answers = await Answer.find({ question: questionId })
    .populate("author", "_id name image")
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalAnswers > skip + answers.length;
  return {
    answers: JSON.parse(JSON.stringify(answers)),
    isNext,
    totalAnswers,
  };
}

export async function getCachedUserAnswers({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string;
  page: number;
  pageSize: number;
}): Promise<{ answers: Answer[]; isNext: boolean }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.answers);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const totalAnswers = await Answer.countDocuments({ author: userId });
  const answers = await Answer.find({ author: userId })
    .populate("author", "_id name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalAnswers > skip + answers.length;
  return { answers: JSON.parse(JSON.stringify(answers)), isNext };
}
