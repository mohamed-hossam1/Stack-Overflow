"use server";

import { User } from "@/database";

import action from "../handlers/action";
import handleError from "../error";
import { ProfileSchema } from "../validations";
import { revalidateUserCache } from "@/lib/cache/revalidate";

export async function updateUser(
  params: UpdateUserParams
): Promise<ActionResponse<User>> {
  const validationResult = await action({
    params,
    schema: ProfileSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return handleError(validationResult.error) as ErrorResponse;
  }

  const { name, username, bio, location, portfolio } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  try {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });

    if (existingUser) {
      throw new Error("Username is already taken");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, username, bio, location, portfolio },
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    await revalidateUserCache(userId);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
