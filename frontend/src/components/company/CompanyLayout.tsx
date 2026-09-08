import type { ReactNode } from "react";

import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";

interface CompanyLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function CompanyLayout({
  title = "Company Dashboard",
  children,
}: CompanyLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-canvas)]">

      <CompanySidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        <CompanyTopbar title={title} />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-7">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}