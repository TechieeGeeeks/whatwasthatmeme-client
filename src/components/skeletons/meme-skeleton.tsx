import React from "react";

type MemeSkeletonProps = {
  count?: number;
};

export const MemeSkeleton: React.FC<MemeSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="shadow-shadow animate-pulse bg-white border-2 h-48"
      />
    ))}
  </div>
  );
};