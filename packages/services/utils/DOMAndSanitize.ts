import { DOMPurifyServices } from "./DOMPurify";
import { SecureSanitizeServices } from "./Sanitize";

export class DOMAndSanitizedServices {
    public static domAndSanitizeObject(obj: unknown) {
        const domPurifyData = DOMPurifyServices.domSanitizedObject(obj);
        const sanitizedData = SecureSanitizeServices.sanitizedArrayOrObject(domPurifyData);
        return sanitizedData;
    }

    public static domAndSanitizeString(str: string, maxSanitizeStringValue: number = 500) {
        if (!str) return '';
        const domPurifyStr = DOMPurifyServices.domSanitizedString(str);
        if (!domPurifyStr) return '';
        const sanitizedStr = SecureSanitizeServices.sanitizedString(domPurifyStr, maxSanitizeStringValue);
        return sanitizedStr;
    }
}