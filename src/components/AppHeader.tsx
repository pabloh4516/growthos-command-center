import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

const periods = ["Hoje", "7d", "30d", "90d", "Custom"];

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Workspace selector */}
        <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            A
          </div>
          <span className="hidden sm:inline">Acme Corp</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </button>

        {/* Period selector — hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1 ml-2 md:ml-4">
          {periods.map((p) => (
            <button
              key={p}
              className={`px-2 md:px-3 py-1 text-xs rounded-md transition-colors ${
                p === "30d"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Search — collapsible on mobile */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors sm:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className={`${searchOpen ? "absolute right-0 top-full mt-2 z-50" : "hidden"} sm:relative sm:block sm:top-auto sm:mt-0`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-8 w-56 sm:w-40 md:w-48 pl-9 pr-3 text-sm bg-secondary border border-border sm:border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
          JD
        </button>
      </div>
    </header>
  );
}
