export const HomePageFilters = [
  { name: "Newest", value: "newest" },
  { name: "Popular", value: "popular" },
  { name: "Unanswered", value: "unanswered" },
];

/** Answer filter options consumed by `getAnswers` in `lib/actions/answer.action.ts`.
 * Maps to sortCriteria switch cases: "latest" → { createdAt: -1 }, "oldest" → { createdAt: 1 }, "popular" → { upvotes: -1 }.
 * Keep in sync if adding new sort modes. */
export const AnswerFilters = [
  { name: "Newest", value: "latest" },
  { name: "Oldest", value: "oldest" },
  { name: "Popular", value: "popular" },
];

export const CollectionFilters = [
  { name: "Oldest", value: "oldest" },
  { name: "Most Voted", value: "mostvoted" },
  { name: "Most Viewed", value: "mostviewed" },
  { name: "Most Recent", value: "mostrecent" },
  { name: "Most Answered", value: "mostanswered" },
];

export const TagFilters = [
  { name: "A-Z", value: "name" },
  { name: "Recent", value: "recent" },
  { name: "Oldest", value: "oldest" },
  { name: "Popular", value: "popular" },
];

export const UserFilters = [
  { name: "Newest", value: "newest" },
  { name: "Oldest", value: "oldest" },
  { name: "Popular", value: "popular" },
];
