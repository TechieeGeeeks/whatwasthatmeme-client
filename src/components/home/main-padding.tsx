import React, { ReactNode } from "react";

const MainPaddingWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="md:p-10 md:px-16 w-full h-full p-4">{children}</div>;
};

export default MainPaddingWrapper;