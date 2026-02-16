import { Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { authEnabled } from "../config";
import { BottomNav } from "./BottomNav";
import { ThemeSelector } from "./ThemeSelector";

export function Layout() {
  return (
    <div className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          {authEnabled ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                variables: { colorPrimary: "var(--accent)" },
              }}
            />
          ) : (
            <div aria-hidden />
          )}
          <ThemeSelector />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-6 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
