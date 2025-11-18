import { Hono } from 'hono';
import { zodValidateResetPassword, zodValidateSignIn, zodValidateVerifiedOTPCode, zodValidateVerifiedEmail, zodValidateSignUp, type ZodValidateVerifiedOTPCode, type ZodValidateSignIn, type ZodValidateSignUp, type ZodValidateVerifiedEmail, type ZodValidateResetPassword, zodValidateSignInWithOTPAndEmail, type ZodValidateSignInWithOTPAndEmail } from '@/api/packages/validations/auth';
import { ZodValidateRestApi } from '@/api/utils/zodValidateRestApi';
import { AuthRestMiddleware } from '@/api/middleware/authREST';
import type { ServerErrorDto } from '@/api/packages/types/constants';
import { HandlerTRPCError } from '@/api/utils/handleTRPCError';
import { DOMAndSanitizeService } from '@/api/packages/utils/DOMAndSanitize';
import { AuthFuncUtils } from '../utils/AuthFuncUtils';
import { AuthFuncHelperServices } from '../utils/authFuncHelperUtils';

const authRestRouter = new Hono();

authRestRouter.post("/sign-in", ZodValidateRestApi.validate("json", zodValidateSignIn), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateSignIn = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body) as ZodValidateSignIn;
        const response = await AuthFuncUtils.signInFunc(sanitizeBody, c);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-in/OTP", ZodValidateRestApi.validate("json", zodValidateSignInWithOTPAndEmail), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateSignInWithOTPAndEmail = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body) as ZodValidateSignInWithOTPAndEmail;
        const response = await AuthFuncUtils.signInWithOTPAndEmailFunc(body, c);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-up", ZodValidateRestApi.validate("json", zodValidateSignUp), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateSignUp = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body) as ZodValidateSignUp;
        const response = await AuthFuncUtils.signUpFunc(sanitizeBody);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-out", AuthRestMiddleware.authSession, async (c) => {
    try {
        const response = await AuthFuncUtils.signOutFunc(c);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/verified-email", ZodValidateRestApi.validate("json", zodValidateVerifiedEmail), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateVerifiedEmail = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeString(body.email, 100) as string;
        const { userAgent, ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(c);
        const res = await AuthFuncUtils.verifiedEmailFunc(sanitizeBody, userAgent, ipAddress);
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/verified-OTP-code", ZodValidateRestApi.validate("json", zodValidateVerifiedOTPCode), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateVerifiedOTPCode = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body) as ZodValidateVerifiedOTPCode;
        const { userAgent, ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(c);
        const res = await AuthFuncUtils.verifiedOTPCodeFunc({ ...sanitizeBody, ipAddress, userAgent });
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/reset-password", ZodValidateRestApi.validate("json", zodValidateResetPassword), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidateResetPassword = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body) as ZodValidateResetPassword;
        const res = await AuthFuncUtils.resetPasswordFunc(sanitizeBody, c);
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

export default authRestRouter;