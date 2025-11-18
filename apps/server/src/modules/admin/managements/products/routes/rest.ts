import { AuthRestMiddleware } from '@/api/middleware/authREST';
import { Hono } from 'hono';
import { zodValidateTRPCFilter } from '@/api/packages/validations/constants';
import { ValidateStaffRoleAndPerUtils } from '@/api/modules/admin/managements/staff/utils/validateRoleAndPer';
import { HandlerHonoError } from '@/api/utils/handlerHonoError';
import { DOMAndSanitizeService } from '@/api/packages/utils/DOMAndSanitize';
import type { FileDto } from '@/api/packages/types/constants';
import type { ZodValidateAddNewProduct } from '@/api/packages/validations/product';
import { DomAndSanitizeRESTBodyMiddleware } from '@/api/middleware/domAndSanitizeRESTBody';

const manageProductRestRouter = new Hono();

manageProductRestRouter.post("/product/add-product/staff/:addByStaffId", AuthRestMiddleware.authSession, async (c) => {
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

export default manageProductRestRouter;