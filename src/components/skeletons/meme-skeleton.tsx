import React from "react";

type MemeSkeletonProps = {
  count?: number;
};

export const MemeSkeleton: React.FC<MemeSkeletonProps> = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white border-2 shadow-light rounded-lg h-48 w-full"></div>
          <div className="mt-2 bg-white border-2 shadow-light h-4 w-3/4 mx-auto rounded"></div>
        </div>
      ))}
    </div>
  );
};