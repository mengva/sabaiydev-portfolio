import { authTRPCRouter } from "@/api/modules/admin/auth/routes/trpc";
import { StaffManageTRPCRouter } from "@/api/modules/admin/managements/staff/routes/trpc";
import { ProductManageTRPCRouter } from "@/api/modules/admin/managements/products/routes/trpc";
import { router } from "./procedures";

export const appRouter = router({
    app: router({
        client: router({

        }),
        admin: router({
            auth: authTRPCRouter as typeof authTRPCRouter,
            manage: router({
                staff: StaffManageTRPCRouter as typeof StaffManageTRPCRouter,
                product: ProductManageTRPCRouter as typeof ProductManageTRPCRouter,
            })
        })
    })
});

export type AppRouter = typeof appRouter;