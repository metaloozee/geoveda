"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function UnauthenticatedRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push("/");
  }, [router]);
  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Authenticated>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex min-h-svh w-full flex-col">
            <div className="flex h-12 shrink-0 items-center border-b px-4">
              <SidebarTrigger />
            </div>
            <div className="flex-1">{children}</div>
          </main>
        </SidebarProvider>
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated>
      <AuthLoading>
        <div className="flex h-svh w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthLoading>
    </>
  );
}
