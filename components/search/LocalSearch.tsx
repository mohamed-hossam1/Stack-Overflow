"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { Input } from "../ui/input";

interface Props {
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ imgSrc, placeholder, otherClasses }: Props) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        router.push(
          formUrlQuery({
            params: searchParams.toString(),
            key: "query",
            value: searchQuery,
          }),
          { scroll: false },
        );
      } else {
        router.push(
          removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          }),
          { scroll: false },
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
