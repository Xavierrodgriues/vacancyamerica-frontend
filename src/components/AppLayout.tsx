import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SupportChatbot } from "@/components/SupportChatbot";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 max-w-[600px] border-r border-post-border min-h-screen">
        {children}
      </main>
      {/* Right sidebar with chat list */}
      <RightSidebar />
      <MobileNav />
      <SupportChatbot />
    </div>
  );
}
