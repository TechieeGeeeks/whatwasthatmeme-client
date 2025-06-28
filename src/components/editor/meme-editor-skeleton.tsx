import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const MemeEditorSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4 rounded-lg">
      <div className="lg:w-2/3 mb-4 lg:mb-0 lg:mr-4">
        <div className="relative flex justify-center">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>
      <div className="lg:w-1/3 space-y-4 overflow-y-auto md:max-h-[500px] px-2 py-2">
        <Card className="p-3">
          <Skeleton className="h-6 w-3/4" />
        </Card>
        {[1].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg shadow-light border-2"
          >
            <div className="flex items-center mb-2">
              <Skeleton className="h-10 flex-grow mr-2" />
              <Skeleton className="w-8 h-8 rounded-md mr-2" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {["Font Size", "Fill Color", "Stroke Width", "Stroke Color"].map(
                (label) => (
                  <div key={label}>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemeEditorSkeleton;
