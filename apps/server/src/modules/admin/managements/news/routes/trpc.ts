import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { zodValidationFilter, type ZodValidationFilter } from "@/api/packages/validations/constants";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { NewsManageQueriesServices } from "../services/queries";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { zodValidationAddOneNews, zodValidationAddOneNewsData, zodValidationEditOneNewsById, zodValidationEditOneNewsDataById, zodValidationGetOneNewsById, zodValidationRemoveOneNewsById, zodValidationSearchQueryNews, type ZodValidationAddOneNews, type ZodValidationEditOneNewsById, type ZodValidationEditOneNewsDataById, type ZodValidationSearchQueryNews } from "@/api/packages/validations/news";
import { ValidationStaffRoleAndPerUtils } from "@/api/utils/validateStaffRoleAndPermission";
import { NewsManageMutationServices } from "../services/mutation";

export const NewsManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        try {
            const filter: ZodValidationFilter = ctx.honoContext.get("body");
            return await NewsManageQueriesServices.list(filter);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    getOne: publicProcedure.input(zodValidationGetOneNewsById).use(AuthTRPCMiddleware.authSession).query(async ({ input }) => {
        try {
            return await NewsManageQueriesServices.getOne(input.newsId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOne: publicProcedure.input(zodValidationAddOneNews).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneNews = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.staffId);

            if (canBeAdd.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await NewsManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOneData: publicProcedure.input(zodValidationAddOneNewsData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneNews = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.staffId);

            if (canBeAdd.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await NewsManageMutationServices.addOneData(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditOneNewsById).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneNewsById = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }

            return await NewsManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editDataById: publicProcedure.input(zodValidationEditOneNewsDataById).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneNewsDataById = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }
            return await NewsManageMutationServices.editDataById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    searchQuery: publicProcedure.input(zodValidationSearchQueryNews).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const bodyQuery: ZodValidationSearchQueryNews = ctx.honoContext.get("body");
            return await NewsManageMutationServices.searchQuery(bodyQuery);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneNewsById).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx, input }) => {
        try {
            const canBeRemove = await ValidationStaffRoleAndPerUtils.canBeRemove(input.removeByStaffId);

            if (canBeRemove.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeRemove.message, canBeRemove.status);
            }
            return await NewsManageMutationServices.removeOneById(input.newsId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    })
})