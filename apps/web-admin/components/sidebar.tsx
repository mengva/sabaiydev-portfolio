// src/components/sidebar.tsx
"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
    LayoutDashboard,
    Users,
    Newspaper,
    HelpCircle,
    Briefcase,
    Package,
    MessageSquare,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "User Management", icon: Users, href: "/admin/management/users" },
    { title: "Product Management", icon: Package, href: "/admin/management/products" },
    { title: "News Management", icon: Newspaper, href: "/admin/management/news" },
    { title: "FAQ Management", icon: HelpCircle, href: "/admin/management/faq" },
    { title: "Career Management", icon: Briefcase, href: "/admin/management/career" },
    { title: "Bulletin Management", icon: MessageSquare, href: "/admin/management/bulletin" },
    { title: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AppSidebar() {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="!text-3xl !font-bold flex justify-center items-center h-14 mb-4 bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text text-transparent">Sabaiydev</SidebarGroupLabel>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link href={item.href} className={`${isActive && '!bg-green-600'}`}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}