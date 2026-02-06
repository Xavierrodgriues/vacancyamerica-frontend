import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 max-w-[600px] border-r border-post-border min-h-screen">
        {children}
      </main>
      {/* Right spacer for desktop */}
      <div className="hidden lg:block flex-1" />
      <MobileNav />
    </div>
  );
}
