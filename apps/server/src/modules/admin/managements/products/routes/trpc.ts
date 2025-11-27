import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { zodValidationAddOneProduct, zodValidationAddOneProductData, zodValidationGetOneProductById, zodValidationRemoveOneProductById, zodValidationEditOneProduct, zodValidationEditOneProductData, type ZodValidationAddOneProduct, type ZodValidationAddOneProductData, type ZodValidationGetOneProductById, type ZodValidationRemoveOneProductById, type ZodValidationEditOneProduct, type ZodValidationEditOneProductData } from "@/api/packages/validations/product";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { ProductManageMutationServices } from "../services/mutation";
import { zodValidationTRPCFilter, type ZodValidationTRPCFilter } from "@/api/packages/validations/constants";
import { ProductManageQueriesServices } from "../services/queries";
import { ValidationProductRoleAndPerUtils } from "../utils/validationRoleAndPer";

export const ProductManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationTRPCFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        try {
            const filter: ZodValidationTRPCFilter = ctx.honoContext.get("body");
            return await ProductManageQueriesServices.list(filter);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    getOne: publicProcedure.input(zodValidationGetOneProductById).use(AuthTRPCMiddleware.authSession).query(async ({ ctx }) => {
        try {
            const param = ctx.honoContext.req.param() as ZodValidationGetOneProductById;
            return await ProductManageQueriesServices.getOne(param.productId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addOne: publicProcedure.input(zodValidationAddOneProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneProduct = ctx.honoContext.get("body");

            const canBeAdd = await ValidationProductRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

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

            const canBeAdd = await ValidationProductRoleAndPerUtils.canBeAddAndEdit(body.addByStaffId);

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

            const canBeEdit = await ValidationProductRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

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

            const canBeEdit = await ValidationProductRoleAndPerUtils.canBeAddAndEdit(body.updatedByStaffId);

            if (canBeEdit.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeEdit.message, canBeEdit.status);
            }

            return await ProductManageMutationServices.editDataById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneProductById).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx, input }) => {
        try {

            const canBeRemove = await ValidationProductRoleAndPerUtils.canBeRemove(input.removeByStaffId);

            if (canBeRemove.message !== "success") {
                throw HandlerTRPCError.TRPCErrorMessage(canBeRemove.message, canBeRemove.status);
            }

            return await ProductManageMutationServices.removeOneById(input.targetProductId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    })
})