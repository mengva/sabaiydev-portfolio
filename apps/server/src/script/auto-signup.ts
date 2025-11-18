import { StaffPermissionEnum, StaffRoleEnum, StaffStatusEnum } from "@/api/packages/utils/constants/auth";
import type { ZodValidateSignUp } from "@/api/packages/validations/auth";
import { TRPCError } from "@trpc/server";
import { Helper } from "../utils/helper";
import { staffs } from "../db";
import db from "../config/db";

// Function to handle auto-signup
export async function autoSignup() {
    try {

        const body: ZodValidateSignUp = {
            fullName: "johndoe",
            email: "johndoe@gmail.com",
            password: 'Johndoe@1234',
            permissions: [StaffPermissionEnum.CREATE, StaffPermissionEnum.READ, StaffPermissionEnum.WRITE, StaffPermissionEnum.UPDATE, StaffPermissionEnum.DELETE, StaffPermissionEnum.MANAGE],
            status: StaffStatusEnum.ACTIVE,
            role: StaffRoleEnum.SUPER_ADMIN
        }

        const hashPassword = await Helper.bcryptHast(body.password);

        await db.transaction(async tx => {
            const emailExisting = await tx.query.staffs.findFirst({
                where: (s, { eq }) => eq(s.email, body.email)
            });
            if (emailExisting) throw new TRPCError({
                message: "email already existing",
                code: "FORBIDDEN"
            });
            await tx.insert(staffs).values({
                ...body,
                password: hashPassword
            });
        });

        console.log("createde staff successfully");

    } catch (error: any) {
        throw new TRPCError({
            message: error?.message ?? 'falied to added staff',
            code: "UNPROCESSABLE_CONTENT",
        });
    }
}