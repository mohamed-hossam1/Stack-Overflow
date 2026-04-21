"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
function updateTags(tags: string[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
}

export async function revalidateQuestionsCache(): Promise<void> {
  updateTags([CACHE_TAGS.questions, CACHE_TAGS.hotQuestions]);
}

export async function revalidateQuestionCache(id: string): Promise<void> {
  updateTags([
    CACHE_TAGS.questions,
    CACHE_TAGS.question(id),
    CACHE_TAGS.hotQuestions,
  ]);
}

export async function revalidateAnswersCache(
  questionId: string
): Promise<void> {
  updateTags([
    CACHE_TAGS.questionAnswers(questionId),
    CACHE_TAGS.question(questionId),
  ]);
}

export async function updateTagsCache(): Promise<void> {
  updateTags([CACHE_TAGS.tags, CACHE_TAGS.topTags]);
}

export async function revalidateUsersCache(): Promise<void> {
  updateTags([CACHE_TAGS.users]);
}

export async function revalidateUserCache(id: string): Promise<void> {
  updateTags([CACHE_TAGS.users, CACHE_TAGS.user(id)]);
}

export async function revalidateHotQuestionsCache(): Promise<void> {
  updateTags([CACHE_TAGS.hotQuestions]);
}

export async function revalidateTopTagsCache(): Promise<void> {
  updateTags([CACHE_TAGS.topTags]);
}
