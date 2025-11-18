import { zodValidateResetPassword, zodValidateSignIn, zodValidateSignInWithOTPAndEmail, zodValidateSignUp, zodValidateVerifiedEmail, zodValidateVerifiedOTPCode } from "@/api/packages/validations/auth";
import { publicProcedure, router } from "@/api/server/trpc/procedures";
import { AuthServices } from "../services/mutation/auth";
import { AuthTRPCMiddleware } from "@/api/middleware/authTRPC";

export const authTRPCRouter = router({
    signIn: publicProcedure.input(zodValidateSignIn).use(AuthTRPCMiddleware.alreadySignIn).mutation(async c => {
        return await AuthServices.signIn(c);
    }),
    signInWithOTPAndEmail: publicProcedure.input(zodValidateSignInWithOTPAndEmail).use(AuthTRPCMiddleware.alreadySignIn).mutation(async c => {
        return await AuthServices.signInWithOTPAndEmail(c);
    }),
    signOut: publicProcedure.use(AuthTRPCMiddleware.authSession).mutation(async c => {
        return await AuthServices.signOut(c);
    }),
    signUp: publicProcedure.input(zodValidateSignUp).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input }) => {
        return await AuthServices.signUp(input);
    }),
    verifiedEmail: publicProcedure.input(zodValidateVerifiedEmail).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.verifiedEmail(input.email, ctx);
    }),
    verifiedOTPCode: publicProcedure.input(zodValidateVerifiedOTPCode).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.verifiedOTPCode(input, ctx);
    }),
    resetPassword: publicProcedure.input(zodValidateResetPassword).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.resetPassword(input, ctx);
    }),
}) 