import { authTRPCRouter } from "@/server/modules/admin/auth/routes/trpc";
import { StaffManageTRPCRouter } from "@/server/modules/admin/managements/staff/routes/trpc";
import { ProductManageTRPCRouter } from "@/server/modules/admin/managements/products/routes/trpc";
import { router } from "./procedures";
import { NewsManageTRPCRouter } from "@/server/modules/admin/managements/news/routes/trpc";
import { FaqManageTRPCRouter } from "@/server/modules/admin/managements/faq/routes/trpc";
import { CareerManageTRPCRouter } from "@/server/modules/admin/managements/careers/routes/trpc";

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
                faq: FaqManageTRPCRouter,
                career: CareerManageTRPCRouter
            })
        })
    })
});

export type AppRouter = typeof appRouter;