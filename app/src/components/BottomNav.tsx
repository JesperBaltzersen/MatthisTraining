import { NavLink } from "react-router-dom";
import { Calendar, BookOpen, History, Plus } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/", icon: Calendar, label: "Kalender" },
  { to: "/library", icon: BookOpen, label: "Bibliotek" },
  { to: "/add", icon: Plus, label: "Tilføj" },
  { to: "/history", icon: History, label: "Historik" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-foreground/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 text-foreground/70 transition-colors",
                isActive
                  ? "text-accent font-medium"
                  : "hover:text-foreground"
              )
            }
          >
            <Icon className="h-6 w-6" strokeWidth={2} />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
