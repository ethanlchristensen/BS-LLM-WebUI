import { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ConversationProvider } from "@/features/conversation/contexts/conversationContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ConversationProvider>
      <div className="flex h-screen max-h-[100dvh] overflow-hidden w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="relative z-0 flex flex-col flex-1 bg-background py-2 pr-2 w-full max-w-full h-full">
            <div className="flex flex-col bg-backgroiund rounded-xl overflow-hidden w-full p-2 h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </ConversationProvider>
  );
}
