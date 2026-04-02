import { DesktopChatPanel } from "@/components/DesktopChatPanel";
import { TopNav } from "@/components/TopNav";
import { MobileNav } from "@/components/MobileNav";
import { useSearchParams } from "react-router-dom";

export default function Messages() {
    const [searchParams] = useSearchParams();
    // On mobile: hide MobileNav when inside a chat (chatId in URL), show it on the list view
    const isInsideChat = !!searchParams.get("chatId");

    return (
        <>
            <TopNav />
            {/*
              pt-16 = clears fixed TopNav
              On mobile list view: pb-16 to make room for MobileNav
              On mobile chat view (chatId set): pb-0, MobileNav hidden
              On desktop: pb-0 always
            */}
            <div className={`pt-16 h-screen overflow-hidden ${!isInsideChat ? "pb-16 md:pb-0" : ""}`}>
                <DesktopChatPanel />
            </div>

            {/* Show bottom nav on list view only; hide when inside a chat on mobile */}
            {!isInsideChat && <MobileNav />}
        </>
    );
}
