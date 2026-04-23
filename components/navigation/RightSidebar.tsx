import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import TagCard from "../cards/TagCard";
import { getCachedHotQuestions } from "@/lib/data/questions";
import { getCachedTopTags } from "@/lib/data/tags";
import { CACHE_TAGS } from "@/lib/cache/tags";

async function CachedSidebarContent() {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.hotQuestions);
  cacheTag(CACHE_TAGS.topTags);

  const [hotQuestions, topTags] = await Promise.all([
    getCachedHotQuestions(),
    getCachedTopTags(),
  ]);

  return (
    <>
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        {hotQuestions.length === 0 ? (
          <p className="body-regular text-dark400_light700 mt-7">No questions have been asked yet.</p>
        ) : (
          <div className="mt-7 flex w-full flex-col gap-[30px]">
            {hotQuestions.map(({ _id, title }: { _id: string; title: string }) => (
              <Link
                key={_id}
                href={ROUTES.QUESTION(_id)}
                className="flex cursor-pointer items-center justify-between gap-7"
              >
                <p className="body-medium text-dark500_light700 line-clamp-2">{title}</p>
                <Image
                  src="/icons/chevron-right.svg"
                  alt="Chevron"
                  width={20}
                  height={20}
                  className="invert-colors"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        {topTags.length === 0 ? (
          <p className="body-regular text-dark400_light700 mt-7">No tags have been created yet.</p>
        ) : (
          <div className="mt-7 flex flex-col gap-4">
            {topTags.map(({ _id, name, questions }: { _id: string; name: string; questions: number }) => (
              <TagCard key={_id} _id={_id} name={name} questions={questions} showCount compact />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const sidebarSkeleton = (
  <div className="animate-pulse space-y-6">
    <div className="h-6 w-32 bg-light-800 dark:bg-dark-300 rounded" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-8 bg-light-800 dark:bg-dark-300 rounded" />
    ))}
    <div className="h-6 w-28 bg-light-800 dark:bg-dark-300 rounded mt-8" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-6 bg-light-800 dark:bg-dark-300 rounded" />
    ))}
  </div>
);

const RightSidebar = () => (
  <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
    <Suspense fallback={sidebarSkeleton}>
      <CachedSidebarContent />
    </Suspense>
  </section>
);

export default RightSidebar;
