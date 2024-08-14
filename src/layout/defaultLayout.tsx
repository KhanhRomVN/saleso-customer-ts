import React from "react";
import HeaderBar from "@/components/HeaderBar";
import Sidebar from "@/components/SideBar";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col">
      <HeaderBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pl-[240px] pt-[70px] p-2.5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
