import React from "react";
import HeaderBar from "@/components/HeaderBar";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col">
      <HeaderBar />
      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto pt-[70px] px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
