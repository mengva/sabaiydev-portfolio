import { AuthRestMiddleware } from '@/api/middleware/authREST';
import { Hono } from 'hono';
import { StaffManageQueriesServices } from '../services/queries/staff';
import { ZodValidateRestApi } from '@/api/utils/zodValidateRestApi';
import { zodValidationGetOneStaffById, zodValidationRestApiAddOneStaffParam, type ZodValidationGetOneStaffById, zodValidationRestApiEditStaffParam, type ZodValidationAddOneStaff, type ZodValidationEditStaff, zodValidationSearchQueryStaff, type ZodValidationSearchQueryStaff, type ZodValidationEditMyData, zodValidationRestApiEditMyData, zodValidationRestApiEditMyDataParam, type ZodValidationRestApiEditMyDataParam } from '@/api/packages/validations/staff';
import { zodValidationFilter } from '@/api/packages/validations/constants';
import { StaffManageMutationServices } from '../services/mutation/staff';
import { HandlerHonoError } from '@/api/utils/handlerHonoError';
import { ValidationStaffRoleAndPerServices } from '../utils/validateRoleAndPer';

const staffManageRestRouter = new Hono();

// get staff all by page and limit
staffManageRestRouter.get("/staffs", AuthRestMiddleware.authSanitizedQueries, async (c) => {
    try {
        const { page, limit } = c.get("body");
        const filter = zodValidationFilter.safeParse({
            page: Number(page),
            limit: Number(limit)
        })
        if (!filter?.success) throw HandlerHonoError.handleHonoError(filter.error);
        const response = await StaffManageQueriesServices.list(filter.data);
        return c.json(response, 200);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// get staff by id
staffManageRestRouter.get("/staffs/:staffId", ZodValidateRestApi.validate("param", zodValidationGetOneStaffById), AuthRestMiddleware.authSession, async (c) => {
    try {
        const param: ZodValidationGetOneStaffById = c.req.valid("param");
        const response = await StaffManageQueriesServices.getOne(param.staffId);
        return c.json(response, 200);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// search staff by condition
staffManageRestRouter.get("/staffs", ZodValidateRestApi.validate("query", zodValidationSearchQueryStaff), AuthRestMiddleware.authSanitizedQueries, async (c) => {
    try {
        const body: ZodValidationSearchQueryStaff = c.get("body");
        const response = await StaffManageMutationServices.searchQuery(body);
        return c.json(response, 200);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// add new staff
staffManageRestRouter.post("/staffs/:addByStaffId/add-staff", ZodValidateRestApi.validate("param", zodValidationRestApiAddOneStaffParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidationAddOneStaff = c.get("body");
        await ValidationStaffRoleAndPerServices.addOneUser(body);
        const response = await StaffManageMutationServices.addOne(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// update staff by id
staffManageRestRouter.put("/staffs/:targetStaffId/edit-staff/:updatedByStaffId", ZodValidateRestApi.validate("param", zodValidationRestApiEditStaffParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidationEditStaff = c.get("body");
        await ValidationStaffRoleAndPerServices.editOneUserById(body);
        const response = await StaffManageMutationServices.editById(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// update my data by id
staffManageRestRouter.put("/staffs/:targetStaffId/edit-my-data/:updatedByStaffId", ZodValidateRestApi.validate("param", zodValidationRestApiEditMyDataParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidationEditMyData = c.get("body");
        await ValidationStaffRoleAndPerServices.editMyData(body);
        const response = await StaffManageMutationServices.editMyDataById(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

export default staffManageRestRouter;