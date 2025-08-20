
"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Home, Settings, Wand2, Mail, CreditCard, ShoppingBag, Globe, Palette, User, Megaphone, MessageSquare, Database } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getGeneralSettings } from "./settings/actions/general-actions";
import type { GeneralSettings } from "./settings/actions/general-actions";

const adminNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <Home /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingBag /> },
    { href: "/admin/submissions", label: "Submissions", icon: <Mail /> },
    { href: "/admin/testimonials", label: "Testimonials", icon: <MessageSquare /> },
    { href: "/admin/marketing", label: "Marketing Setup", icon: <Megaphone /> },
    { href: "/admin/seo-geo-settings", label: "SEO & Geo Settings", icon: <Globe /> },
    { href: "/admin/settings", label: "Website Settings", icon: <Settings /> },
    { href: "/admin/database-tools", label: "Database Tools", icon: <Database /> },
    { href: "/admin/profile", label: "Profile", icon: <User /> },
    { href: "/admin/seo-tool", label: "SEO Tool", icon: <Wand2 /> },
];

interface AdminSidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function AdminSidebar({ className, onLinkClick }: AdminSidebarProps) {
    const pathname = usePathname();
    const [settings, setSettings] = useState<GeneralSettings | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            const data = await getGeneralSettings();
            setSettings(data);
        }
        fetchSettings();
    }, []);

    const handleLinkClick = () => {
        if (onLinkClick) {
            onLinkClick();
        }
    };

    return (
        <aside className={cn("bg-background border-r flex-col", className)}>
            <div className="p-6 border-b">
                <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
            </div>
            <nav className="p-4">
                <ul>
                    {adminNavLinks.map((link) => (
                        <li key={link.href}>
                            <Link 
                                href={link.href}
                                onClick={handleLinkClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    (pathname.startsWith(link.href) && (link.href !== '/admin/settings' || pathname === '/admin/settings')) && "bg-muted text-primary"
                                )}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}
