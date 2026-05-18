"use server";

import mongoose from "mongoose";

import { Collection, Question } from "@/database";

import action from "../handlers/action";
import handleError from "../error";
import { CollectionBaseSchema, PaginatedSearchParamsSchema } from "../validations";

export async function toggleCollection(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return handleError(validationResult.error) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingCollection = await Collection.findOne({
      author: userId,
      question: questionId,
    }).session(session);

    let saved: boolean;

    if (existingCollection) {
      await Collection.deleteOne({ _id: existingCollection._id }).session(session);
      saved = false;
    } else {
      await Collection.create([{ author: userId, question: questionId }], { session });
      saved = true;
    }

    await session.commitTransaction();

    return { success: true, data: { saved } };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function getCollectionStatus(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return { success: true, data: { saved: false } };
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return { success: true, data: { saved: false } };

  try {
    const collection = await Collection.findOne({
      author: userId,
      question: questionId,
    });

    return { success: true, data: { saved: !!collection } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserCollections(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return handleError(validationResult.error) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query } = params;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const filterQuery: Record<string, unknown> = { author: userId };

    const totalCollections = await Collection.countDocuments(filterQuery);

    const collections = await Collection.find(filterQuery)
      .populate({
        path: "question",
        populate: [
          { path: "tags", select: "name" },
          { path: "author", select: "name image" },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const questions = collections
      .map((c) => c.question)
      .filter(Boolean) as unknown as Question[];

    const isNext = totalCollections > skip + collections.length;

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
