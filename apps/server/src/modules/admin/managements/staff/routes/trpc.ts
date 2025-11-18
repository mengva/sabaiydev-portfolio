import { zodValidateAddNewStaff, zodValidateGetStaffById, zodValidateRemoveStaffById, zodValidateSearchStaffData, zodValidateUpdatedMyData, zodValidateUpdatedStaff, type ZodValidateAddNewStaff, type ZodValidateGetStaffById, type ZodValidateRemoveStaffById, type ZodValidateSearchStaffData, type ZodValidateUpdatedMyData, type ZodValidateUpdatedStaff } from "@/api/packages/validations/staff";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { StaffManageMutationServices } from "../services/mutation/staff";
import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { StaffManageQueriesServices } from "../services/queries/staff";
import { zodValidateTRPCFilter, type ZodValidateTRPCFilter } from "@/api/packages/validations/constants";
import { ValidateStaffRoleAndPerUtils } from "../utils/validateRoleAndPer";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

export const StaffManageTRPCRouter = router({
    list: publicProcedure.input(zodValidateTRPCFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const filter: ZodValidateTRPCFilter = ctx.get("body");
        return await StaffManageQueriesServices.list(filter);
    }),
    getOne: publicProcedure.input(zodValidateGetStaffById).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const param: ZodValidateGetStaffById = ctx.get("body");
        return await StaffManageQueriesServices.getOne(param.staffId);
    }),
    getBySessionToken: publicProcedure.use(AuthTRPCMiddleware.authSession).query(async ({ ctx }) => {
        const staffId = ctx.get("session").staffId;
        return await StaffManageQueriesServices.getOne(staffId);
    }),
    addOne: publicProcedure.input(zodValidateAddNewStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateAddNewStaff = ctx.get("body");
            const isAdd = await ValidateStaffRoleAndPerUtils.addOneUser(body);
            if (!isAdd) {
                throw new HTTPErrorMessage("You have no an permissions to add user", "403");
            }
            const response = await StaffManageMutationServices.addOne(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidateUpdatedStaff).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedStaff = ctx.get("body");
            const isCanEdit = await ValidateStaffRoleAndPerUtils.editOneUserById(body);
            if (!isCanEdit) {
                throw new HTTPErrorMessage("You have no an permissions to edit user", "403")
            }
            const response = await StaffManageMutationServices.editById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editMyData: publicProcedure.input(zodValidateUpdatedMyData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedMyData = ctx.get("body");
            const { targetStaffId, updatedByStaffId } = body;
            const isEdit = await ValidateStaffRoleAndPerUtils.editMyData({
                targetStaffId,
                updatedByStaffId
            });
            if (!isEdit) {
                throw new HTTPErrorMessage("Failed somthing to edit user data", "403")
            }
            const response = await StaffManageMutationServices.editMyDataById(body);
            return response;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeById: publicProcedure.input(zodValidateRemoveStaffById).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        const params: ZodValidateRemoveStaffById = ctx.get("body");
        const valid = await ValidateStaffRoleAndPerUtils.removeOneById(params);
        if (!valid) {
            throw new HTTPErrorMessage("You have no an permission to remove this staff", "403");
        }
        const response = await StaffManageMutationServices.removeById(params.targetStaffId);
        return response;
    }),
    searchQuery: publicProcedure.input(zodValidateSearchStaffData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        const search: ZodValidateSearchStaffData = ctx.get("body");
        const response = await StaffManageMutationServices.searchQuery(search);
        return response;
    })
});