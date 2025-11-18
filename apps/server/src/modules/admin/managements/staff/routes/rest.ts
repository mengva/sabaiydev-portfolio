import { AuthRestMiddleware } from '@/api/middleware/authREST';
import { Hono } from 'hono';
import { StaffManageQueriesServices } from '../services/queries/staff';
import { ZodValidateRestApi } from '@/api/utils/zodValidateRestApi';
import { zodValidateGetStaffById, zodValidateRestApiAddNewStaffParam, type ZodValidateGetStaffById, zodValidateRestApiUpdatedStaffParam, type ZodValidateAddNewStaff, type ZodValidateUpdatedStaff, zodValidateSearchStaffData, type ZodValidateSearchStaffData, type ZodValidateUpdatedMyData, zodValidateRestApiUpdatedMyData, zodValidateRestApiUpdatedMyDataParam, type ZodValidateRestApiUpdatedMyDataParam } from '@/api/packages/validations/staff';
import { zodValidateTRPCFilter } from '@/api/packages/validations/constants';
import { StaffManageMutationServices } from '../services/mutation/staff';
import { ValidateStaffRoleAndPerUtils } from '@/api/modules/admin/managements/staff/utils/validateRoleAndPer';
import { HandlerHonoError } from '@/api/utils/handlerHonoError';

const manageStaffRestRouter = new Hono();

// get staff all by page and limit
manageStaffRestRouter.get("/staffs", AuthRestMiddleware.authSanitizedQueries, async (c) => {
    try {
        const { page, limit } = c.get("body");
        const filter = zodValidateTRPCFilter.safeParse({
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
manageStaffRestRouter.get("/staffs/:staffId", ZodValidateRestApi.validate("param", zodValidateGetStaffById), AuthRestMiddleware.authSession, async (c) => {
    try {
        const param: ZodValidateGetStaffById = c.req.valid("param");
        const response = await StaffManageQueriesServices.getOne(param.staffId);
        return c.json(response, 200);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// search staff by condition
manageStaffRestRouter.get("/staffs", ZodValidateRestApi.validate("query", zodValidateSearchStaffData), AuthRestMiddleware.authSanitizedQueries, async (c) => {
    try {
        const body: ZodValidateSearchStaffData = c.get("body");
        const response = await StaffManageMutationServices.searchQuery(body);
        return c.json(response, 200);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// add new staff
manageStaffRestRouter.post("/staffs/:addByStaffId/add-staff", ZodValidateRestApi.validate("param", zodValidateRestApiAddNewStaffParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidateAddNewStaff = c.get("body");
        await ValidateStaffRoleAndPerUtils.addOneUser(body);
        const response = await StaffManageMutationServices.addOne(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// update staff by id
manageStaffRestRouter.put("/staffs/:targetStaffId/edit-staff/:updatedByStaffId", ZodValidateRestApi.validate("param", zodValidateRestApiUpdatedStaffParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidateUpdatedStaff = c.get("body");
        await ValidateStaffRoleAndPerUtils.editOneUserById(body);
        const response = await StaffManageMutationServices.editById(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

// update my data by id
manageStaffRestRouter.put("/staffs/:targetStaffId/edit-my-data/:updatedByStaffId", ZodValidateRestApi.validate("param", zodValidateRestApiUpdatedMyDataParam), AuthRestMiddleware.authSanitizedParamAndBody, async (c) => {
    try {
        const body: ZodValidateUpdatedMyData = c.get("body");
        const { targetStaffId, updatedByStaffId } = body;
        await ValidateStaffRoleAndPerUtils.editMyData({
            targetStaffId,
            updatedByStaffId
        });
        const response = await StaffManageMutationServices.editMyDataById(body);
        return c.json(response, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

export default manageStaffRestRouter;