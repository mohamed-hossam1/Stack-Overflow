export const CACHE_TAGS = {
  questions: "questions",
  answers: "answers",
  tags: "tags",
  users: "users",
  hotQuestions: "hot-questions",
  topTags: "top-tags",
  question: (id: string): `question:${string}` => `question:${id}`,
  user: (id: string): `user:${string}` => `user:${id}`,
  questionAnswers: (questionId: string): `question-answers:${string}` =>
    `question-answers:${questionId}`,
} as const;
