import db from "@/server/config/db";
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];