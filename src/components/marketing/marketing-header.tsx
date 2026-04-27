import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/products", label: "Our Products" },
  { to: "/live-market", label: "Live Market" },
  { to: "/explore-funds", label: "Explore Funds" },
  { to: "/unlisted-equities", label: "Unlisted Equities" },
  { to: "/sip-calculator", label: "SIP Calculator" },
  { to: "/risk-analyzer", label: "Risk Analyzer" },
] as const;

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo to="/" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                "data-[status=active]:text-foreground data-[status=active]:bg-secondary",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden gradient-brand text-primary-foreground shadow-glow sm:inline-flex">
            <Link to="/login">Login / Register</Link>
          </Button>
          <Button asChild size="sm" className="gradient-brand text-primary-foreground shadow-glow sm:hidden">
            <Link to="/login">Login</Link>
          </Button>

          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                      "data-[status=active]:text-foreground data-[status=active]:bg-secondary",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 gradient-brand text-primary-foreground">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login / Register
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
