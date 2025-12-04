import { AuthTRPCMiddleware } from "@/server/middleware/authTRPC";
import { zodValidationFilter, type ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { publicProcedure, router } from "@/server/server/trpc/procedures";
import { CareerManageQueriesServices } from "../services/queries";
import { zodValidationAddOneCareerData, zodValidationDeleteOneCareerById, zodValidationEditOneCareerData, zodValidationGetOneCareerById, zodValidationSearchQueryCareer, type ZodValidationAddOneCareerData, type ZodValidationEditOneCareerData, type ZodValidationSearchQueryCareer } from "@/server/packages/validations/career";
import { ValidationStaffRoleAndPerUtils } from "@/server/utils/validateStaffRoleAndPermission";
import { CareerManageMutationServices } from "../services/mutation";

export const CareerManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        try {
            const filter: ZodValidationFilter = ctx.honoContext.get("body");
            return await CareerManageQueriesServices.list(filter);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    getOne: publicProcedure.input(zodValidationGetOneCareerById).use(AuthTRPCMiddleware.authSession).query(async ({ input }) => {
        try {
            return await CareerManageQueriesServices.getOne(input.careerId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOne: publicProcedure.input(zodValidationAddOneCareerData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneCareerData = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

            if (canBeAdd.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await CareerManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditOneCareerData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneCareerData = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }

            return await CareerManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    searchQuery: publicProcedure.input(zodValidationSearchQueryCareer).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const bodyQuery: ZodValidationSearchQueryCareer = ctx.honoContext.get("body");
            return await CareerManageMutationServices.searchQuery(bodyQuery);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationDeleteOneCareerById).use(AuthTRPCMiddleware.authSession).mutation(async ({ input }) => {
        try {
            const canBeRemove = await ValidationStaffRoleAndPerUtils.canBeRemove(input.removeByStaffId);

            if (canBeRemove.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeRemove.message, canBeRemove.status);
            }
            return await CareerManageMutationServices.removeOneById(input.careerId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
});