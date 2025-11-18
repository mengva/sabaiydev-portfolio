// src/components/TopbarSkeleton.tsx
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { Bell, Sun } from "lucide-react";

export function TopbarSkeletonComponent() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            {/* Left: Title + Sidebar Trigger */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-md hidden md:block" />
                <Skeleton className="h-6 w-40" />
            </div>

            {/* Right: Icons + Avatar */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" disabled className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    <Skeleton className="absolute -top-1 -right-1 h-5 w-5 rounded-full" />
                </Button>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" disabled className="rounded-full">
                    <Sun className="h-5 w-5" />
                </Button>

                {/* Avatar-round placeholder */}
                <Skeleton className="h-9 w-9 rounded-full" />
            </div>
        </header>
    );
}