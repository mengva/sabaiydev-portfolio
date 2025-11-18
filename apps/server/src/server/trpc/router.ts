import { authTRPCRouter } from "@/api/modules/admin/auth/routes/trpc";
import { ManageStaffTRPCRouter } from "@/api/modules/admin/managements/staff/routes/trpc";
import { ManageProductTRPCRouter } from "@/api/modules/admin/managements/products/routes/trpc";
import { router } from "./procedures";

export const appRouter = router({
    app: router({
        client: router({

        }),
        admin: router({
            auth: authTRPCRouter as typeof authTRPCRouter,
            staff: ManageStaffTRPCRouter as typeof ManageStaffTRPCRouter,
            product: ManageProductTRPCRouter as typeof ManageProductTRPCRouter,
        })
    })
});

export type AppRouter = typeof appRouter;