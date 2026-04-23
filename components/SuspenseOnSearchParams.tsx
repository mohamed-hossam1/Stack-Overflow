"use client";

import { ReactNode, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function SuspenseOnSearchParams({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  return (
    <Suspense key={searchParams.toString()} fallback={fallback}>
      {children}
    </Suspense>
  );
}
