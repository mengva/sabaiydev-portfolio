// src/components/topbar.tsx
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Bell, LogOut, User, Moon, Sun, Monitor, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import trpc from "@/app/trpc/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ServerResponseDto } from "@/admin/packages/types/constants";

// === i18n Dictionary ===
const translations = {
    en: {
        adminDashboard: "Admin Dashboard",
        newJobApplications: "New Job Applications",
        total: "total",
        viewAllApplications: "View All Applications",
        newApplication: "New application received",
        underReview: "Application under review",
        interviewScheduled: "Interview scheduled",
        new: "New",
        reviewed: "Reviewed",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        system: "System",
        myAccount: "My Account",
        profile: "Profile",
        signOut: "Sign Out",
        confirmSignOut: "Confirm Sign Out",
        signOutDescription: "Are you sure you want to sign out of the admin dashboard?",
        cancel: "Cancel",
        confirm: "Confirm",
        signingOut: "Signing out…",
        language: "Language",
    },
    th: {
        adminDashboard: "แดชบอร์ดผู้ดูแล",
        newJobApplications: "ใบสมัครงานใหม่",
        total: "ทั้งหมด",
        viewAllApplications: "ดูใบสมัครทั้งหมด",
        newApplication: "ได้รับใบสมัครใหม่",
        underReview: "อยู่ระหว่างการตรวจสอบ",
        interviewScheduled: "กำหนดสัมภาษณ์แล้ว",
        new: "ใหม่",
        reviewed: "ตรวจสอบแล้ว",
        theme: "ธีม",
        light: "สว่าง",
        dark: "มืด",
        system: "ตามระบบ",
        myAccount: "บัญชีของฉัน",
        profile: "โปรไฟล์",
        signOut: "ออกจากระบบ",
        confirmSignOut: "ยืนยันการออกจากระบบ",
        signOutDescription: "คุณแน่ใจหรือไม่ว่าต้องการออกจากแดชบอร์ดผู้ดูแล?",
        cancel: "ยกเลิก",
        confirm: "ยืนยัน",
        signingOut: "กำลังออกจากระบบ…",
        language: "ภาษา",
    },
    lo: {
        adminDashboard: "ແຜງຄວບຄຸມຜູ້ດູແລລະບົບ",
        newJobApplications: "ໃບສະໝັກວຽກໃໝ່",
        total: "ທັງໝົດ",
        viewAllApplications: "ເບິ່ງໃບສະໝັກທັງໝົດ",
        newApplication: "ໄດ້ຮັບໃບສະໝັກໃໝ່",
        underReview: "ກຳລັງພິຈາລະນາ",
        interviewScheduled: "ກຳນົດສໍາພາດແລ້ວ",
        new: "ໃໝ່",
        reviewed: "ພິຈາລະນາແລ້ວ",
        theme: "ຮູບແບບ",
        light: "ສະຫວ່າງ",
        dark: "ມືດ",
        system: "ຕາມລະບົບ",
        myAccount: "ບັນຊີຂອງຂ້ອຍ",
        profile: "ໂປຣໄຟລ໌",
        signOut: "ອອກຈາກລະບົບ",
        confirmSignOut: "ຢືນຢັນອອກຈາກລະບົບ",
        signOutDescription: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກແຜງຄວບຄຸມ?",
        cancel: "ຍົກເລີກ",
        confirm: "ຢືນຢັນ",
        signingOut: "ກຳລັງອອກຈາກລະບົບ…",
        language: "ພາສາ",
    },
} as const;

type Language = keyof typeof translations;

// === Mock Notifications (with translation keys) ===
const mockApplications = [
    {
        id: 1,
        candidate: "Sarah Johnson",
        position: "Senior Frontend Developer",
        status: "New",
        timeAgo: "2m ago",
        avatar: "SJ",
        read: false,
    },
    {
        id: 2,
        candidate: "Mike Chen",
        position: "Product Manager",
        status: "Reviewed",
        timeAgo: "15m ago",
        avatar: "MC",
        read: true,
    },
    {
        id: 3,
        candidate: "Emily Rodriguez",
        position: "UX Designer",
        status: "Interview Scheduled",
        timeAgo: "1h ago",
        avatar: "ER",
        read: false,
    },
    {
        id: 4,
        candidate: "David Kim",
        position: "DevOps Engineer",
        status: "New",
        timeAgo: "3h ago",
        avatar: "DK",
        read: false,
    },
    {
        id: 5,
        candidate: "Lisa Patel",
        position: "Marketing Specialist",
        status: "Reviewed",
        timeAgo: "5h ago",
        avatar: "LP",
        read: true,
    },
];

export function Topbar() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [notifications] = useState(mockApplications);
    const [hasUnread] = useState(mockApplications.some((n) => !n.read));
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    // === Language State ===
    const [lang, setLang] = useState<Language>("en");

    // Load language from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("app-language") as Language | null;
        const browserLang = navigator.language.split("-")[0];
        if (browserLang) {
            const defaultLang: Language = ["en", "th", "lo"].includes(browserLang) ? (browserLang as Language) : "en";
            setLang(saved || defaultLang);
        }
    }, []);

    // Save language when changed
    const changeLanguage = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem("app-language", newLang);
    };

    const t = translations[lang];

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMarkRead = (id: number) => {
        // setNotifications logic (omitted for brevity)
    };

    const signOutMutation = trpc.app.admin.auth.signOut.useMutation({
        onSuccess: (data: ServerResponseDto) => {
            if (data?.success) {
                toast.success(data.message);
                return router.push("/auth/signin");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
        onSettled: () => {
            setShowSignOutDialog(false);
        },
    });

    if (!mounted) return null;

    return (
        <>
            <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="hidden md:block" />
                    <h1 className="text-xl font-semibold">{t.adminDashboard}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* === Notifications === */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full">
                                <Bell className="h-5 w-5" />
                                {hasUnread && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                                    >
                                        {notifications.filter((n) => !n.read).length}
                                    </Badge>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-0">
                            <div className="p-2">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>{t.newJobApplications}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {notifications.length} {t.total}
                                    </Badge>
                                </DropdownMenuLabel>
                            </div>
                            <DropdownMenuSeparator />
                            {notifications.map((notif) => (
                                <DropdownMenuItem
                                    key={notif.id}
                                    className={`flex w-full cursor-pointer gap-3 p-3 ${!notif.read ? "bg-accent" : ""}`}
                                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {notif.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium line-clamp-1">
                                            {notif.candidate} applied for {notif.position}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {notif.status === "New"
                                                ? t.newApplication
                                                : notif.status === "Reviewed"
                                                    ? t.underReview
                                                    : t.interviewScheduled}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={notif.status === "New" ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {notif.status === "New" ? t.new : notif.status === "Reviewed" ? t.reviewed : t.interviewScheduled}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{notif.timeAgo}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="justify-center">
                                <Link href="/admin/management/career" className="w-full text-center cursor-pointer">
                                    {t.viewAllApplications}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* === Theme Toggle === */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                {theme === "dark" ? (
                                    <Moon className="h-5 w-5" />
                                ) : theme === "light" ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Monitor className="h-5 w-5" />
                                )}
                                <span className="sr-only">{t.theme}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" />
                                <span>{t.light}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" />
                                <span>{t.dark}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                                <Monitor className="mr-2 h-4 w-4" />
                                <span>{t.system}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* === User Menu with Language Switcher === */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-9 w-9 cursor-pointer">
                                <AvatarImage src="" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{t.myAccount}</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>{t.profile}</span>
                            </DropdownMenuItem>

                            {/* Language Switcher */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Globe className="mr-2 h-4 w-4" />
                                        <span>{t.language}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => changeLanguage("en")} className="cursor-pointer">
                                        <span className="mr-2">🇬🇧</span> English
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => changeLanguage("th")} className="cursor-pointer">
                                        <span className="mr-2">🇹🇭</span> ไทย
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => changeLanguage("lo")} className="cursor-pointer">
                                        <span className="mr-2">🇱🇦</span> ລາວ
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => setShowSignOutDialog(true)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t.signOut}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* === Sign Out Dialog === */}
            <Dialog open={showSignOutDialog} onOpenChange={(open) => !signOutMutation.isPending && setShowSignOutDialog(open)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t.confirmSignOut}</DialogTitle>
                        <DialogDescription>{t.signOutDescription}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSignOutDialog(false)}
                            disabled={signOutMutation.isPending}
                            className="cursor-pointer"
                        >
                            {t.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => signOutMutation.mutate()}
                            disabled={signOutMutation.isPending}
                            className="cursor-pointer"
                        >
                            {signOutMutation.isPending ? t.signingOut : t.confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}