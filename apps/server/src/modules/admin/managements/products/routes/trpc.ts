import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";
import { zodValidationAddOneProduct, zodValidationAddOneProductData, zodValidationGetOneProductById, zodValidationRemoveOneProductById, zodValidationEditOneProduct, zodValidationEditOneProductData, type ZodValidationAddOneProduct, type ZodValidationAddOneProductData, type ZodValidationGetOneProductById, type ZodValidationRemoveOneProductById, type ZodValidationEditOneProduct, type ZodValidationEditOneProductData } from "@/api/packages/validations/product";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { ProductManageMutationServices } from "../services/mutation";
import { zodValidationTRPCFilter, type ZodValidationTRPCFilter } from "@/api/packages/validations/constants";
import { ProductManageQueriesServices } from "../services/queries";

export const ProductManageTRPCRouter = router({
    list: publicProcedure.input(zodValidationTRPCFilter).use(AuthTRPCMiddleware.authSanitizedBody).query(async ({ ctx }) => {
        const filter: ZodValidationTRPCFilter = ctx.honoContext.get("body");
        return await ProductManageQueriesServices.list(filter);
    }),
    getOne: publicProcedure.input(zodValidationGetOneProductById).use(AuthTRPCMiddleware.authSession).query(async ({ ctx }) => {
        const param = ctx.honoContext.req.param() as ZodValidationGetOneProductById;
        return await ProductManageQueriesServices.getOne(param.productId);
    }),
    addOne: publicProcedure.input(zodValidationAddOneProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneProduct = ctx.honoContext.get("body");
            return await ProductManageMutationServices.addOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    addDataOne: publicProcedure.input(zodValidationAddOneProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationAddOneProductData = ctx.honoContext.get("body")
            return await ProductManageMutationServices.addDataOne(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editById: publicProcedure.input(zodValidationEditOneProduct).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneProduct = ctx.honoContext.get("body")
            return await ProductManageMutationServices.editById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    editDataById: publicProcedure.input(zodValidationEditOneProductData).use(AuthTRPCMiddleware.authSanitizedBody).mutation(async ({ ctx }) => {
        try {
            const body: ZodValidationEditOneProductData = ctx.honoContext.get("body");
            return await ProductManageMutationServices.editDataById(body);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }),
    removeOneById: publicProcedure.input(zodValidationRemoveOneProductById).use(AuthTRPCMiddleware.authSession).mutation(async ({ ctx }) => {
        try {
            const body = ctx.honoContext.req.param() as ZodValidationRemoveOneProductById;
            return await ProductManageMutationServices.removeOneById(body.targetProductId, body.cloudId);
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    })
})