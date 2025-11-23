import db from "@/api/config/db";
import { ManageStaffUtils } from "../../utils/staff";
import { staffs } from "@/api/db";
import { count, desc, eq } from "drizzle-orm";
import type { ZodValidateTRPCFilter } from "@/api/packages/validations/constants";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { HandlerSuccess } from "@/api/utils/handleSuccess";
import { getHTTPError } from "@/api/packages/utils/HttpJsError";

export class StaffManageQueriesServices {

    public static list = async (input: ZodValidateTRPCFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;
            // 1️⃣ Get paginated data
            const admins = await db
                .select(ManageStaffUtils.selectStaffData) // ⬅️ customize this to match `this.option.selectedStaffInfo`
                .from(staffs)
                .orderBy(desc(staffs.createdAt))
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
                ...ManageStaffUtils.selectStaffData
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