"use client";

import Image from "next/image";
import { useState } from "react";

import { toast } from "sonner";

interface BookmarkButtonProps {
  questionId: string;
  saved: boolean;
  toggleAction: (params: { questionId: string }) => Promise<ActionResponse<{ saved: boolean }>>;
}

const BookmarkButton = ({ questionId, saved: initialSaved, toggleAction }: BookmarkButtonProps) => {
  const [saved, setSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const previousState = saved;
    setSaved((prev) => !prev);
    setIsLoading(true);

    try {
      const result = await toggleAction({ questionId });

      if (!result.success) {
        setSaved(previousState);
        return toast("Failed to update bookmark", {
          description: result.error?.message,
        });
      }

      if (result.data) {
        setSaved(result.data.saved);
      }
    } catch {
      setSaved(previousState);
      toast("Failed to update bookmark", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={saved ? "/icons/star-filled.svg" : "/icons/star.svg"}
      width={18}
      height={18}
      alt="Bookmark"
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      onClick={handleToggle}
    />
  );
};

export default BookmarkButton;
