
import moment from "moment"
import type { ZodValidatePermissions } from "../validations/constants";

class GlobalHelper {

    public static cloneObject(data: any) {
        return JSON.parse(JSON.stringify(data));
    }

    public static uniquePermissions(permissions: ZodValidatePermissions) {
        return [...new Set(permissions)] as ZodValidatePermissions;
    }

    public static getPaginationRange(current: number, total: number) {
        const delta = 1 // how many pages before/after current
        const range: (number | string)[] = []

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i)
            } else if (range[range.length - 1] !== "...") {
                range.push("...")
            }
        }

        return range;
    }

    public static formatDate(date: Date, format = "YYYY/MM/DD") {
        return moment(date).format(format);
    }

    public static trimObjectValue(obj: any): any {
        if (Array.isArray(obj) && obj.length) {
            return obj.map(item => this.trimObjectValue(item));
        }
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = this.trimObjectValue(obj[key]);
                }
            }
            return obj;
        }
        if (typeof obj === 'string') {
            return obj.trim();
        }
        return obj;
    }

    public static clearObjectValue(obj: any): any {
        if (Array.isArray(obj) && obj.length) {
            return obj.map(item => this.clearObjectValue(item));
        }
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = this.clearObjectValue(obj[key]);
                }
            }
            return obj;
        }
        if (typeof obj === 'string') {
            return obj = '';
        }
        if (typeof obj === 'number') {
            return obj = 0;
        }
        if (typeof obj === 'boolean') {
            return obj = false;
        }
        return obj;
    }

    public static setObjectValue(obj: any, newObj: any): any {
        if (typeof obj !== typeof newObj) return obj;
        if (Array.isArray(obj) && obj.length) {
            return obj.map((item, index) => this.setObjectValue(item, newObj[index]));
        }
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (typeof obj[key] === "object" || (Array.isArray(obj[key]) && obj[key].length))
                        obj[key] = this.setObjectValue(obj[key], newObj[key]);
                    else obj[key] = newObj[key];
                }
            }
            return obj;
        }

        if (typeof obj === 'string' && typeof newObj === 'string') {
            return obj = newObj;
        }

        if (typeof obj === 'number' && typeof newObj === 'number') {
            return obj = newObj;
        }

        if (typeof obj === 'boolean' && typeof newObj === 'boolean') {
            return obj = newObj;
        }
        return obj;
    }
}

export default GlobalHelper