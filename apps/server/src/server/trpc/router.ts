import { authTRPCRouter } from "@/api/modules/admin/auth/routes/trpc";
import { StaffManageTRPCRouter } from "@/api/modules/admin/managements/staff/routes/trpc";
import { ProductManageTRPCRouter } from "@/api/modules/admin/managements/products/routes/trpc";
import { router } from "./procedures";

export const appRouter = router({
    app: router({
        client: router({

        }),
        admin: router({
            auth: authTRPCRouter,
            manage: router({
                staff: StaffManageTRPCRouter,
                product: ProductManageTRPCRouter,
            })
        })
    })
});

export type AppRouter = typeof appRouter;