import { cacheLife, cacheTag } from "next/cache";
import { FilterQuery } from "mongoose";

import { Question, Tag, TagQuestion } from "@/database";
import { CACHE_TAGS } from "@/lib/cache/tags";
import dbConnect from "@/lib/mongoose";

export async function getCachedTags({
  page = 1,
  pageSize = 10,
  query,
  filter,
}: {
  page: number;
  pageSize: number;
  query?: string;
  filter?: string;
}): Promise<{ tags: Tag[]; isNext: boolean }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.tags);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);
  const filterQuery: FilterQuery<typeof Tag> = {};

  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  }

  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
  }

  const totalTags = await Tag.countDocuments(filterQuery);
  const tags = await Tag.find(filterQuery)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalTags > skip + tags.length;
  return { tags: JSON.parse(JSON.stringify(tags)), isNext };
}

export async function getCachedTagQuestions({
  tagId,
  page = 1,
  pageSize = 10,
  query,
}: {
  tagId: string;
  page: number;
  pageSize: number;
  query?: string;
}): Promise<{ tag: Tag; questions: Question[]; isNext: boolean }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.tags);
  cacheTag(CACHE_TAGS.questions);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const tag = await Tag.findById(tagId).lean();
  if (!tag) throw new Error("Tag not found");

  const filterQuery: FilterQuery<typeof Question> = { tags: { $in: [tagId] } };
  if (query) {
    filterQuery.title = { $regex: query, $options: "i" };
  }

  const totalQuestions = await Question.countDocuments(filterQuery);
  const questions = await Question.find(filterQuery)
    .select("_id title views answers upvotes downvotes author createdAt")
    .populate([
      { path: "author", select: "name image" },
      { path: "tags", select: "name" },
    ])
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalQuestions > skip + questions.length;
  return {
    tag: JSON.parse(JSON.stringify(tag)),
    questions: JSON.parse(JSON.stringify(questions)),
    isNext,
  };
}

export async function getCachedTopTags(): Promise<Tag[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.topTags);

  await dbConnect();

  const tags = await Tag.find().sort({ questions: -1 }).limit(5).lean();
  return JSON.parse(JSON.stringify(tags));
}

export async function getCachedUserTopTags(userId: string): Promise<Tag[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.tags);

  await dbConnect();

  const userQuestions = await Question.find({ author: userId }).select("_id");
  const questionIds = userQuestions.map((q) => q._id);

  const tagCounts = await TagQuestion.aggregate([
    { $match: { question: { $in: questionIds } } },
    { $group: { _id: "$tag", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "tags",
        localField: "_id",
        foreignField: "_id",
        as: "tag",
      },
    },
    { $unwind: "$tag" },
    {
      $project: {
        _id: "$tag._id",
        name: "$tag.name",
        questions: "$count",
      },
    },
  ]);

  return JSON.parse(JSON.stringify(tagCounts));
}
