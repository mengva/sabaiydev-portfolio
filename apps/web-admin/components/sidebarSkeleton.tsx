// src/components/SidebarSkeleton.tsx
import { Skeleton } from "@workspace/ui/components/skeleton";

export function SidebarSkeletonComponent() {
    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background md:translate-x-0">
            <div className="flex h-full flex-col">
                {/* Logo + Title */}
                <div className="flex h-16 items-center gap-3 border-b px-6">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-5 w-32" />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1 p-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 ${i === 0 ? "bg-accent" : ""
                                }`}
                        >
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className={`h-4 flex-1 ${i === 0 ? "w-28" : "w-32"}`} />
                            {i === 0 && <Skeleton className="h-4 w-12 rounded-full ml-auto" />}
                        </div>
                    ))}
                </nav>

                {/* Bottom: Settings */}
                <div className="border-t p-3">
                    <div className="flex items-center gap-3 rounded-md px-3 py-2.5">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>
        </aside>
    );
}