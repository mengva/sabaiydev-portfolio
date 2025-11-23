import { AuthRestMiddleware } from '@/api/middleware/authREST';
import { Hono } from 'hono';
import { zodValidationTRPCFilter } from '@/api/packages/validations/constants';
import { ValidationStaffRoleAndPerUtils } from '@/api/modules/admin/managements/staff/utils/ValidationRoleAndPer';
import { HandlerHonoError } from '@/api/utils/handlerHonoError';
import { DOMAndSanitizedServices } from '@/api/packages/utils/DOMAndSanitize';
import type { FileDto } from '@/api/packages/types/constants';
import type { ZodValidationAddOneProduct } from '@/api/packages/validations/product';
import { DomAndSanitizeRESTBodyMiddleware } from '@/api/middleware/domAndSanitizeRESTBody';

const productManageRestRouter = new Hono();

productManageRestRouter.post("/product/add-product/staff/:addByStaffId", AuthRestMiddleware.authSession, async (c) => {
    try {
        // parse multipart form data
        const formData = await c.req.formData();
        const imageFiles = formData.getAll("files");
        const userAgent = c.get("userAgent")

        if(userAgent && userAgent.includes("PostmanRuntime") && imageFiles && imageFiles.length > 0){
            console.log("post send file")
        }else console.log("no postman")
        // const param = c.req.param().addByStaffId;
        // const body = await c.req.json()

        console.log("userAgent", userAgent);
        console.log("imageFiles", imageFiles);

        if(imageFiles && imageFiles.length > 0){
            for(const imageFile of imageFiles){
                if(imageFile instanceof File){
                    console.log("image is File", imageFile)
                }else console.log("image is not File formatter");
            }
        }

        const body = c.get("body") || {};


        // // Parse text fields (they come as strings)
        // const addByStaffId = c.req.param("addByStaffId");
        // const category = form["category"];
        // const status = form["status"];
        // const technologies = JSON.parse(form["technologies"] || "[]");
        // const translations = JSON.parse(form["translations"] || "[]");

        // // Get uploaded files
        // const imageFiles = form["files"];
        // const imageFilesArray = Array.isArray(imageFiles) ? imageFiles : imageFiles ? [imageFiles] : [];

        return c.json({
            // imageFiles,
            body,
            imageFiles
            // formData
        }, 201);
    } catch (error) {
        throw HandlerHonoError.handleHonoError(error);
    }
});

export default productManageRestRouter;