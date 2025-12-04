import { AuthTRPCMiddleware } from "@/server/middleware/authTRPC";
import { zodValidationFilter, type ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { FaqManageQueriesServices } from "../services/queries";
import { zodValidationAddOneFaqData, zodValidationEditOneFaqData, zodValidationGetOneFaqById, zodValidationRemoveOneFaqById, zodValidationSearchQueryFaq, type ZodValidationAddOneFaqData, type ZodValidationEditOneFaqData, type ZodValidationSearchQueryFaq } from "@/server/packages/validations/faq";
import { ValidationStaffRoleAndPerUtils } from "@/server/utils/validateStaffRoleAndPermission";
import { FaqManageMutationServices } from "../services/mutation";
import { publicProcedure, router } from "@/server/server/trpc/procedures";

export const FaqManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        try {
            const filter: ZodValidationFilter = ctx.honoContext.get("body");
            return await FaqManageQueriesServices.list(filter);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    getOne: publicProcedure.input(zodValidationGetOneFaqById).use(AuthTRPCMiddleware.authSession).query(async ({ input }) => {
        try {
            return await FaqManageQueriesServices.getOne(input.faqId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOne: publicProcedure.input(zodValidationAddOneFaqData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneFaqData = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

            if (canBeAdd.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await FaqManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditOneFaqData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneFaqData = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }

            return await FaqManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    searchQuery: publicProcedure.input(zodValidationSearchQueryFaq).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const bodyQuery: ZodValidationSearchQueryFaq = ctx.honoContext.get("body");
            return await FaqManageMutationServices.searchQuery(bodyQuery);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneFaqById).use(AuthTRPCMiddleware.authSession).mutation(async ({ input }) => {
        try {
            const canBeRemove = await ValidationStaffRoleAndPerUtils.canBeRemove(input.removeByStaffId);

            if (canBeRemove.error) {
                throw HandlerTRPCError.TRPCErrorMessage(canBeRemove.message, canBeRemove.status);
            }
            return await FaqManageMutationServices.removeOneById(input.faqId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
});