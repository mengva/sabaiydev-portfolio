import { Hono } from 'hono';
import { zodValidationResetPassword, zodValidationSignIn, zodValidationVerifiedOTPCode, zodValidationVerifiedEmail, zodValidationSignUp, type ZodValidationVerifiedOTPCode, type ZodValidationSignIn, type ZodValidationSignUp, type ZodValidationVerifiedEmail, type ZodValidationResetPassword, zodValidationSignInOTP, type ZodValidationSignInOTP } from '@/api/packages/validations/auth';
import { ZodValidateRestApi } from '@/api/utils/zodValidateRestApi';
import { AuthRestMiddleware } from '@/api/middleware/authREST';
import type { ServerErrorDto } from '@/api/packages/types/constants';
import { HandlerTRPCError } from '@/api/utils/handleTRPCError';
import { DOMAndSanitizedServices } from '@/api/packages/utils/domAndSanitize';
import { AuthFuncHelperServices } from '../utils/authFuncHelperUtils';
import { AuthFuncUtils } from '../utils/AuthFuncUtils';

const authRestRouter = new Hono();

authRestRouter.post("/sign-in", ZodValidateRestApi.validate("json", zodValidationSignIn), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationSignIn = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationSignIn;
        const response = await AuthFuncUtils.signInFunc(sanitizeBody, c);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-in/OTP", ZodValidateRestApi.validate("json", zodValidationSignInOTP), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationSignInOTP = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationSignInOTP;
        const response = await AuthFuncUtils.signInOTPFunc(sanitizeBody, c);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-up", ZodValidateRestApi.validate("json", zodValidationSignUp), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationSignUp = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationSignUp;
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

authRestRouter.post("/verified-email", ZodValidateRestApi.validate("json", zodValidationVerifiedEmail), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationVerifiedEmail = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeString(body.email, 100) as string;
        const { userAgent, ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(c);
        const res = await AuthFuncUtils.verifiedEmailFunc(sanitizeBody, userAgent, ipAddress);
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/verified-OTP-code", ZodValidateRestApi.validate("json", zodValidationVerifiedOTPCode), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationVerifiedOTPCode = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationVerifiedOTPCode;
        const { userAgent, ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(c);
        const res = await AuthFuncUtils.verifiedOTPCodeFunc({ ...sanitizeBody, ipAddress, userAgent });
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/reset-password", ZodValidateRestApi.validate("json", zodValidationResetPassword), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationResetPassword = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationResetPassword;
        const res = await AuthFuncUtils.resetPasswordFunc(sanitizeBody, c);
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

export default authRestRouter;