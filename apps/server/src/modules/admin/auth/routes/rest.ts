import { Hono } from 'hono';
import { zodValidationResetPassword, zodValidationSignIn, zodValidationVerifiedOTPCode, zodValidationVerifiedEmail, zodValidationSignUp, type ZodValidationVerifiedOTPCode, type ZodValidationSignIn, type ZodValidationSignUp, type ZodValidationVerifiedEmail, type ZodValidationResetPassword, zodValidationSignInOTP, type ZodValidationSignInOTP } from '@/server/packages/validations/auth';
import { ZodValidateRestApi } from '@/server/utils/zodValidateRestApi';
import { AuthRestMiddleware } from '@/server/middleware/authREST';
import type { ServerErrorDto } from '@/server/packages/types/constants';
import { HandlerTRPCError } from '@/server/utils/handleTRPCError';
import { DOMAndSanitizedServices } from '@/server/packages/utils/domAndSanitize';
import { AuthFuncHelperServices } from '../utils/authFuncHelper';
import { AuthFuncServices } from '../utils/authFunc';

const authRestRouter = new Hono();

authRestRouter.post("/sign-in", ZodValidateRestApi.validate("json", zodValidationSignIn), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationSignIn = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationSignIn;
        const response = await AuthFuncServices.signInFunc(sanitizeBody, c);
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
        const response = await AuthFuncServices.signInOTPFunc(sanitizeBody, c);
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
        const response = await AuthFuncServices.signUpFunc(sanitizeBody);
        if (response) {
            return c.json(response, 201);
        }
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/sign-out", AuthRestMiddleware.authSession, async (c) => {
    try {
        const response = await AuthFuncServices.signOutFunc(c);
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
        const res = await AuthFuncServices.verifiedEmailFunc(sanitizeBody, userAgent, ipAddress);
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
        const res = await AuthFuncServices.verifiedOTPCodeFunc({ ...sanitizeBody, ipAddress, userAgent });
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

authRestRouter.post("/reset-password", ZodValidateRestApi.validate("json", zodValidationResetPassword), AuthRestMiddleware.alreadySignIn, async (c) => {
    try {
        const body: ZodValidationResetPassword = c.req.valid("json");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(body) as ZodValidationResetPassword;
        const res = await AuthFuncServices.resetPasswordFunc(sanitizeBody, c);
        return c.json(res, 201);
    } catch (error: ServerErrorDto) {
        throw HandlerTRPCError.TRPCError(error);
    }
});

export default authRestRouter;