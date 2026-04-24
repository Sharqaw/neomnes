import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

interface LayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export default function Layout({ children, showRightSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:max-w-[600px] w-full border-r border-[#2f3336]">
        {children}
      </main>
      {showRightSidebar && (
        <div className="hidden xl:block w-[350px] sticky top-0 h-screen">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
