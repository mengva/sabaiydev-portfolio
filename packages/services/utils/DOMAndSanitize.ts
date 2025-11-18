import { DOMPurifyServices } from "./DOMPurify";
import { SecureSanitizeServices } from "./Sanitize";

export class DOMAndSanitizeService {
    public static domAndSanitizeObject(obj: unknown) {
        const domPurifyData = DOMPurifyServices.domSanitizeObject(obj);
        const sanitizeData = SecureSanitizeServices.sanitizeArrayOrObject(domPurifyData);
        return sanitizeData;
    }

    public static domAndSanitizeString(str: string, maxSanitizeStringValue: number = 500) {
        if (!str) return '';
        const domPurifyStr = DOMPurifyServices.domSanitizeString(str);
        if (!domPurifyStr) return '';
        const sanitizeStr = SecureSanitizeServices.sanitizeString(domPurifyStr, maxSanitizeStringValue);
        return sanitizeStr;
    }
}