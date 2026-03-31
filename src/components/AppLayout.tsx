import { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SupportChatbot } from "@/components/SupportChatbot";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #f8f9fc 0%, #f1f4f9 50%, #f5f3ff10 100%)" }}>
      <TopNav />
      {/* Spacer for fixed nav */}
      <div className="h-16" />
      
      <main className="max-w-[1440px] w-full mx-auto flex gap-6 lg:gap-8 px-4 md:px-8 py-6 items-start justify-center">
        <LeftSidebar />
        
        <div className="flex-1 max-w-[600px] min-w-0">
          {children}
        </div>
        
        <RightSidebar />
      </main>
      
      <MobileNav />
      <SupportChatbot />
    </div>
  );
}
