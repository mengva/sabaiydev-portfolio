import { LocalDto } from "../../../types/constants";

// vairables
export const ValidationEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
export const validateMaxFileSize = 10 * 1024 * 1024; //10MB
export const AllowedImageFileType = "image/jpeg, image/png, image/web";

export const LocalArray = ["en", "lo", "th"] as LocalDto[];