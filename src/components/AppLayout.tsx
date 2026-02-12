import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SupportChatbot } from "@/components/SupportChatbot";
import { useLocation, useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 max-w-[600px] border-r border-post-border min-h-screen">
        {children}
      </main>
      <RightSidebar />
      <MobileNav />
      <SupportChatbot />
    </div>
  );
}
