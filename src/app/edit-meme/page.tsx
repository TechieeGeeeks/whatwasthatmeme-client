"use client";
import EditMeme from "@/components/editor/edit-meme";
import MemeEditorSkeleton from "@/components/editor/meme-editor-skeleton";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<MemeEditorSkeleton />}>
      <EditMeme />
    </Suspense>
  );
};

export default Page;
