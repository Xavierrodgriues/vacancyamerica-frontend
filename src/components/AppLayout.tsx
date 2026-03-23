import { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SupportChatbot } from "@/components/SupportChatbot";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      {/* Spacer for fixed nav */}
      <div className="h-16" />
      
      <main className="max-w-[1440px] w-full mx-auto flex gap-6 lg:gap-8 px-4 md:px-8 py-6 items-start justify-center">
        <LeftSidebar />
        
        <div className="flex-1 max-w-[720px] min-w-0">
          {children}
        </div>
        
        <RightSidebar />
      </main>
      
      <MobileNav />
      <SupportChatbot />
    </div>
  );
}
