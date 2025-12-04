import db from "@/server/config/db";
import { StaffManageServices } from "../../utils/staff";
import { staffs } from "@/server/db";
import { count, desc, eq } from "drizzle-orm";
import type { ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { getHTTPError } from "@/server/packages/utils/httpJsError";

export class StaffManageQueriesServices {

    public static list = async (input: ZodValidationFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;
            const adminActive = eq(staffs.status, "ACTIVE");
            // 1️⃣ Get paginated data
            const admins = await db
                .select(StaffManageServices.selectStaffData) // ⬅️ customize this to match `this.option.selectedStaffInfo`
                .from(staffs)
                .where(adminActive)
                .orderBy(desc(staffs.updatedAt))
                .limit(limit)
                .offset(offset);
            // 2️⃣ Count total
            const resultTotal = await db.select({ total: count() }).from(staffs);
            const total = resultTotal[0]?.total || 0;
            // 3️⃣ Calculate pagination
            const totalPage = Math.ceil(Number(total) / limit);
            // 4️⃣ Return formatted response
            return HandlerSuccess.success("Staff list retrieved successfully", {
                data: admins,
                pagination: {
                    total,
                    page,
                    totalPage,
                    limit,
                },
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    };

    public static getOne = async (staffId: string) => {
        try {
            const result = await db.select({
                ...StaffManageServices.selectStaffData
            }).from(staffs).where(eq(staffs.id, staffId)).limit(1);
            const admin = result[0];
            if (!admin) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            return HandlerSuccess.success("Staff retrieved successfully", admin);
        } catch (error) {
            throw getHTTPError(error);
        }
    }

}