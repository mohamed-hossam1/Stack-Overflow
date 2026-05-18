"use server";

import mongoose from "mongoose";

import { Question, Vote } from "@/database";
import Answer, { IAnswerDoc } from "@/database/answer.model";

import action from "../handlers/action";
import handleError from "../error";
import { AnswerServerSchema, DeleteAnswerSchema } from "../validations";
import { revalidateAnswersCache } from "@/lib/cache/revalidate";

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return handleError(validationResult.error) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session }
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();

    await revalidateAnswersCache(questionId);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (!validationResult.success) {
    return handleError(validationResult.error) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const answer = await Answer.findById(answerId).session(session);

    if (!answer) {
      throw new Error("Answer not found");
    }

    if (answer.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    const questionId = answer.question.toString();

    await Vote.deleteMany({ actionId: answerId }).session(session);

    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { session }
    );

    await Answer.findByIdAndDelete(answerId).session(session);

    await session.commitTransaction();

    await revalidateAnswersCache(questionId);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
