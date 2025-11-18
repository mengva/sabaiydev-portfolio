import dotenv from "dotenv";
import { SecureEnv } from "./secureEnv";
import { SecurityHeaders } from "./secureHeader";

dotenv.config();

export const env = SecureEnv.get;
export const header = SecurityHeaders;