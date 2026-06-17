import React from "react";

type AppWrapProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
};

const AppWrap = ({ id, className, children }: AppWrapProps) => {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
};

export default AppWrap;
