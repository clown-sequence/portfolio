import React from "react";

export const BentoGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto'}>
      {children}
    </div>
  );
};