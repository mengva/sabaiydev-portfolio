import { authTRPCRouter } from "@/api/modules/admin/auth/routes/trpc";
import { StaffManageTRPCRouter } from "@/api/modules/admin/managements/staff/routes/trpc";
import { ProductManageTRPCRouter } from "@/api/modules/admin/managements/products/routes/trpc";
import { router } from "./procedures";
import { NewsManageTRPCRouter } from "@/api/modules/admin/managements/news/routes/trpc";
import { FaqManageTRPCRouter } from "@/api/modules/admin/managements/faq/routes/trpc";

export const appRouter = router({
    app: router({
        client: router({

        }),
        admin: router({
            auth: authTRPCRouter,
            manage: router({
                staff: StaffManageTRPCRouter,
                product: ProductManageTRPCRouter,
                news: NewsManageTRPCRouter,
                faq: FaqManageTRPCRouter
            })
        })
    })
});

export type AppRouter = typeof appRouter;