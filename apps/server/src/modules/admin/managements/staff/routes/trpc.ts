import { zodValidationAddOneStaff, zodValidationGetOneStaffById, zodValidationRemoveOneStaffById, zodValidationSearchStaffData, zodValidationEditMyData, zodValidationEditStaff, type ZodValidationAddOneStaff, type ZodValidationGetOneStaffById, type ZodValidationRemoveOneStaffById, type ZodValidationSearchStaffData, type ZodValidationEditMyData, type ZodValidationEditStaff } from "@/api/packages/validations/staff";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { StaffManageMutationServices } from "../services/mutation/staff";
import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { StaffManageQueriesServices } from "../services/queries/staff";
import { zodValidationTRPCFilter, type ZodValidationTRPCFilter } from "@/api/packages/validations/constants";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { ValidationStaffRoleAndPerUtils } from "../utils/validateRoleAndPer";

export const StaffManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationTRPCFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const filter: ZodValidationTRPCFilter = ctx.honoContext.get("body");
        return await StaffManageQueriesServices.list(filter);
    }),
    getOne: publicProcedure.input(zodValidationGetOneStaffById).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const param: ZodValidationGetOneStaffById = ctx.honoContext.get("body");
        return await StaffManageQueriesServices.getOne(param.staffId);
    }),
    getBySessionToken: publicProcedure.use(AuthTRPCMiddleware.authSession).query(async ({ ctx }) => {
        const staffId = ctx.honoContext.get("session").staffId;
        return await StaffManageQueriesServices.getOne(staffId);
    }),
    addOne: publicProcedure.input(zodValidationAddOneStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneStaff = ctx.honoContext.get("body");
            await ValidationStaffRoleAndPerUtils.addOneUser(body);
            const response = await StaffManageMutationServices.addOne(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditStaff = ctx.honoContext.get("body");
            await ValidationStaffRoleAndPerUtils.editOneUserById(body);
            const response = await StaffManageMutationServices.editById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editMyDataById: publicProcedure.input(zodValidationEditMyData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditMyData = ctx.honoContext.get("body");
            await ValidationStaffRoleAndPerUtils.editMyData(body);
            const response = await StaffManageMutationServices.editMyDataById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneStaffById).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        const params: ZodValidationRemoveOneStaffById = ctx.honoContext.get("body");
        await ValidationStaffRoleAndPerUtils.removeOneById(params);
        const response = await StaffManageMutationServices.removeOneById(params.targetStaffId);
        return response;
    }),
    searchQuery: publicProcedure.input(zodValidationSearchStaffData).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx, input }) => {
        const response = await StaffManageMutationServices.searchQuery(input);
        return response;
    })
});