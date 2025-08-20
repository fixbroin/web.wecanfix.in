
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import LoadingLink from "./LoadingLink";
import type { GeneralSettings } from "@/app/admin/settings/actions/general-actions";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function HeaderContent({ settings }: { settings?: GeneralSettings | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({ href, label }: { href: string, label: string }) => {
    const isActive = pathname === href;
    return (
      <LoadingLink
        href={href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-foreground/80"
        )}
      >
        {label}
      </LoadingLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
        <nav className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild className="hidden md:inline-flex" variant="outline">
            <LoadingLink href="/contact">Get Quote</LoadingLink>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <div className="mb-8">
                  <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
                </div>
                <nav className="flex flex-col space-y-6">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <Button asChild className="mt-8 w-full" onClick={() => setIsOpen(false)}>
                  <LoadingLink href="/contact">Get Quote</LoadingLink>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default function Header({ appName, settings }: { appName?: string, settings?: GeneralSettings | null }) {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) {
        return null;
    }
    return <HeaderContent settings={settings} />;
}
