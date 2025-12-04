import { zodValidationResetPassword, zodValidationSignIn, zodValidationSignInOTP, zodValidationSignUp, zodValidationVerifiedEmail, zodValidationVerifiedOTPCode } from "@/server/packages/validations/auth";
import { publicProcedure, router } from "@/server/server/trpc/procedures";
import { AuthServices } from "../services/mutation/auth";
import { AuthTRPCMiddleware } from "@/server/middleware/authTRPC";

export const authTRPCRouter = router({
    signIn: publicProcedure.input(zodValidationSignIn).use(AuthTRPCMiddleware.alreadySignIn).mutation(async c => {
        return await AuthServices.signIn(c);
    }),
    signInOTP: publicProcedure.input(zodValidationSignInOTP).use(AuthTRPCMiddleware.alreadySignIn).mutation(async c => {
        return await AuthServices.signInOTP(c);
    }),
    signOut: publicProcedure.use(AuthTRPCMiddleware.authSession).mutation(async c => {
        return await AuthServices.signOut(c);
    }),
    signUp: publicProcedure.input(zodValidationSignUp).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input }) => {
        return await AuthServices.signUp(input);
    }),
    sendOTPSignIn: publicProcedure.input(zodValidationVerifiedEmail).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.sendOTPSignIn(input.email, ctx['honoContext']);
    }),
    verifiedEmail: publicProcedure.input(zodValidationVerifiedEmail).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.verifiedEmail(input.email, ctx);
    }),
    verifiedOTPCode: publicProcedure.input(zodValidationVerifiedOTPCode).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.verifiedOTPCode(input, ctx);
    }),
    resetPassword: publicProcedure.input(zodValidationResetPassword).use(AuthTRPCMiddleware.alreadySignIn).mutation(async ({ input, ctx }) => {
        return await AuthServices.resetPassword(input, ctx['honoContext']);
    }),
}) 