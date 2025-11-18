import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import React from 'react'

function LoadingComponent() {
    return (
        <main className="flex-1 space-y-8">
            <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-96" />
            </div>
            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="mt-1 h-4 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Users + Recent Activities */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="mt-1 h-4 w-56" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-3 w-12" />
                            </div>
                        ))}
                        <Skeleton className="mt-4 h-9 w-full" />
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="mt-1 h-4 w-56" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        ))}
                        <Skeleton className="mt-4 h-9 w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default LoadingComponent
