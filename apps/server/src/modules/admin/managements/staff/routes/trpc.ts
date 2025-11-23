import { zodValidateAddNewStaff, zodValidateGetStaffById, zodValidateRemoveStaffById, zodValidateSearchStaffData, zodValidateUpdatedMyData, zodValidateUpdatedStaff, type ZodValidateAddNewStaff, type ZodValidateGetStaffById, type ZodValidateRemoveStaffById, type ZodValidateSearchStaffData, type ZodValidateUpdatedMyData, type ZodValidateUpdatedStaff } from "@/api/packages/validations/staff";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { StaffManageMutationServices } from "../services/mutation/staff";
import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { StaffManageQueriesServices } from "../services/queries/staff";
import { zodValidateTRPCFilter, type ZodValidateTRPCFilter } from "@/api/packages/validations/constants";
import { ValidateStaffRoleAndPerUtils } from "../utils/validateRoleAndPer";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";

export const StaffManageTRPCRouter = router({
    list: publicProcedure.input(zodValidateTRPCFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const filter: ZodValidateTRPCFilter = ctx.honoContext.get("body");
        return await StaffManageQueriesServices.list(filter);
    }),
    getOne: publicProcedure.input(zodValidateGetStaffById).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const param: ZodValidateGetStaffById = ctx.honoContext.get("body");
        return await StaffManageQueriesServices.getOne(param.staffId);
    }),
    getBySessionToken: publicProcedure.use(AuthTRPCMiddleware.authSession).query(async ({ ctx }) => {
        const staffId = ctx.honoContext.get("session").staffId;
        return await StaffManageQueriesServices.getOne(staffId);
    }),
    addOne: publicProcedure.input(zodValidateAddNewStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateAddNewStaff = ctx.honoContext.get("body");
            await ValidateStaffRoleAndPerUtils.addOneUser(body);
            const response = await StaffManageMutationServices.addOne(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidateUpdatedStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedStaff = ctx.honoContext.get("body");
            await ValidateStaffRoleAndPerUtils.editOneUserById(body);
            const response = await StaffManageMutationServices.editById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editMyDataById: publicProcedure.input(zodValidateUpdatedMyData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedMyData = ctx.honoContext.get("body");
            await ValidateStaffRoleAndPerUtils.editMyData(body);
            const response = await StaffManageMutationServices.editMyDataById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidateRemoveStaffById).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        const params: ZodValidateRemoveStaffById = ctx.honoContext.get("body");
        await ValidateStaffRoleAndPerUtils.removeOneById(params);
        const response = await StaffManageMutationServices.removeOneById(params.targetStaffId);
        return response;
    }),
    searchQuery: publicProcedure.input(zodValidateSearchStaffData).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx, input }) => {
        const response = await StaffManageMutationServices.searchQuery(input);
        return response;
    })
});