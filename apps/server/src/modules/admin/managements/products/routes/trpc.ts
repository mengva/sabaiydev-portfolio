import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { zodValidateAddNewProduct, zodValidateAddNewProductData, zodValidateRemoveProductById, zodValidateUpdatedProduct, zodValidateUpdatedProductData, type ZodValidateAddNewProduct, type ZodValidateAddNewProductData, type ZodValidateRemoveProductById, type ZodValidateUpdatedProduct, type ZodValidateUpdatedProductData } from "@/api/packages/validations/product";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { ProductManageMutationServices } from "../services/mutation";

export const ProductManageTRPCRouter = router({
    addOne: publicProcedure.input(zodValidateAddNewProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateAddNewProduct = ctx.honoContext.get("body");
            return await ProductManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addDataOne: publicProcedure.input(zodValidateAddNewProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateAddNewProductData = ctx.honoContext.get("body")
            return await ProductManageMutationServices.addDataOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidateUpdatedProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedProduct = ctx.honoContext.get("body")
            return await ProductManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editDataById: publicProcedure.input(zodValidateUpdatedProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateUpdatedProductData = ctx.honoContext.get("body")
            return await ProductManageMutationServices.editDataById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidateRemoveProductById).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidateRemoveProductById = ctx.honoContext.get("body")
            return await ProductManageMutationServices.removeOneById(body.targetProductId, body.cloudId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    })
})