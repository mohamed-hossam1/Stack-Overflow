import { cacheLife, cacheTag } from "next/cache";
import { FilterQuery } from "mongoose";

import Question from "@/database/question.model";
import { CACHE_TAGS } from "@/lib/cache/tags";
import dbConnect from "@/lib/mongoose";

export async function getCachedQuestions({
  page = 1,
  pageSize = 10,
  query,
  filter,
}: {
  page: number;
  pageSize: number;
  query: string;
  filter: string;
}): Promise<{ questions: Question[]; isNext: boolean }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.questions);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);
  const filterQuery: FilterQuery<typeof Question> = {};

  if (filter === "recommended") {
    return { questions: [], isNext: false };
  }

  if (query) {
    filterQuery.$text = { $search: query };
  }

  let sortCriteria = {};
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }

  let totalQuestions = await Question.countDocuments(filterQuery);
  let questions = await Question.find(filterQuery)
    .populate("tags", "name")
    .populate("author", "name image")
    .lean()
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);

  if (query && questions.length === 0) {
    delete filterQuery.$text;
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
    totalQuestions = await Question.countDocuments(filterQuery);
    questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
  }

  const isNext = totalQuestions > skip + questions.length;
  return { questions: JSON.parse(JSON.stringify(questions)), isNext };
}

export async function getCachedQuestion(questionId: string): Promise<Question> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.questions);
  cacheTag(CACHE_TAGS.question(questionId));

  await dbConnect();

  const question = await Question.findById(questionId)
    .populate("tags")
    .populate("author", "_id name image")
    .lean();

  if (!question) throw new Error("Question not found");

  return JSON.parse(JSON.stringify(question));
}

export async function getCachedHotQuestions(): Promise<Question[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.hotQuestions);

  await dbConnect();

  const questions = await Question.find()
    .sort({ views: -1, upvotes: -1 })
    .limit(5)
    .lean();

  return JSON.parse(JSON.stringify(questions));
}

export async function getCachedUserQuestions({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string;
  page: number;
  pageSize: number;
}): Promise<{ questions: Question[]; isNext: boolean }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.questions);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const totalQuestions = await Question.countDocuments({ author: userId });
  const questions = await Question.find({ author: userId })
    .populate("tags", "name")
    .populate("author", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalQuestions > skip + questions.length;
  return { questions: JSON.parse(JSON.stringify(questions)), isNext };
}
