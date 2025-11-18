import authRestRouter from "@/api/modules/admin/auth/routes/rest";
import manageProductRestRouter from "@/api/modules/admin/managements/products/routes/rest";
import manageStaffRestRouter from "@/api/modules/admin/managements/staff/routes/rest";
import { Hono } from 'hono';

const restAPIRoute = new Hono();

restAPIRoute.route("/admin/auth", authRestRouter);
restAPIRoute.route("/admin/management", manageStaffRestRouter);
restAPIRoute.route("/admin/management", manageProductRestRouter);

export default restAPIRoute;