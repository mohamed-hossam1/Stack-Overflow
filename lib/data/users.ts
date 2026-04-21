import { cacheLife, cacheTag } from "next/cache";
import { FilterQuery } from "mongoose";

import { User } from "@/database";
import { CACHE_TAGS } from "@/lib/cache/tags";
import dbConnect from "@/lib/mongoose";

export async function getCachedUsers({
  page = 1,
  pageSize = 10,
  query,
  filter,
}: {
  page: number;
  pageSize: number;
  query?: string;
  filter?: string;
}): Promise<{ users: User[]; isNext: boolean }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.users);

  await dbConnect();

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;
  const filterQuery: FilterQuery<typeof User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }

  const totalUsers = await User.countDocuments(filterQuery);
  const users = await User.find(filterQuery)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const isNext = totalUsers > skip + users.length;
  return { users: JSON.parse(JSON.stringify(users)), isNext };
}

export async function getCachedUser(userId: string): Promise<User> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.users);
  cacheTag(CACHE_TAGS.user(userId));

  await dbConnect();

  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  return JSON.parse(JSON.stringify(user));
}
