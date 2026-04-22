import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { ImpersonationBanner } from "./impersonation-banner";
import { ComplianceFooter } from "./compliance-footer";

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <AppTopbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <ComplianceFooter />
      </div>
    </div>
  );
}
