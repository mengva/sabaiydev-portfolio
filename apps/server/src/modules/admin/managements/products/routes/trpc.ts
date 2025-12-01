import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { zodValidationAddOneProduct, zodValidationAddOneProductData, zodValidationGetOneProductById, zodValidationRemoveOneProductById, zodValidationEditOneProduct, zodValidationEditOneProductData, type ZodValidationAddOneProduct, type ZodValidationAddOneProductData, type ZodValidationGetOneProductById, type ZodValidationRemoveOneProductById, type ZodValidationEditOneProduct, type ZodValidationEditOneProductData, zodValidationSearchQueryProduct, type ZodValidationSearchQueryProduct } from "@/api/packages/validations/product";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { ProductManageMutationServices } from "../services/mutation";
import { zodValidationFilter, type ZodValidationFilter } from "@/api/packages/validations/constants";
import { ProductManageQueriesServices } from "../services/queries";
import { ValidationStaffRoleAndPerUtils } from "@/api/utils/validateStaffRoleAndPermission";

export const ProductManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        try {
            const filter: ZodValidationFilter = ctx.honoContext.get("body");
            return await ProductManageQueriesServices.list(filter);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    getOne: publicProcedure.input(zodValidationGetOneProductById).use(AuthTRPCMiddleware.authSession).query(async ({ input }) => {
        try {
            return await ProductManageQueriesServices.getOne(input.productId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOne: publicProcedure.input(zodValidationAddOneProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneProduct = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

            if (canBeAdd.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await ProductManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOneData: publicProcedure.input(zodValidationAddOneProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneProductData = ctx.honoContext.get("body");

            const canBeAdd = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

            if (canBeAdd.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeAdd.message, canBeAdd.status);
            }

            return await ProductManageMutationServices.addOneData(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditOneProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneProduct = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }

            return await ProductManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editDataById: publicProcedure.input(zodValidationEditOneProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneProductData = ctx.honoContext.get("body");

            const canBeEdit = await ValidationStaffRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }
            return await ProductManageMutationServices.editDataById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    searchQuery: publicProcedure.input(zodValidationSearchQueryProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const bodyQuery: ZodValidationSearchQueryProduct = ctx.honoContext.get("body");
            return await ProductManageMutationServices.searchQuery(bodyQuery);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneProductById).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx, input }) => {
        try {
            const canBeRemove = await ValidationStaffRoleAndPerUtils.canBeRemove(input.removeByStaffId);

            if (canBeRemove.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeRemove.message, canBeRemove.status);
            }
            return await ProductManageMutationServices.removeOneById(input.targetProductId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    })
})