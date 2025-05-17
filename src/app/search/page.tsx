"use client";
import { MemeSkeleton } from "@/components/skeletons/meme-skeleton";
import SearchMeme from "@/components/search/search-meme";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<MemeSkeleton />}>
      <SearchMeme />
    </Suspense>
  );
};

export default Page;
