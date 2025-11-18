import { DOMPurifyServices } from "./DOMPurify";

export class SecureSanitizeServices {
    private static isValidDateString(str: string): boolean {
        const date = new Date(str);
        return !isNaN(date.getTime());
    }

    public static sanitizeString(str: string, maxLength: number): string {
        if (typeof str !== 'string') return '';
        return str
            .trim()
            .replace(/[<></>'"&]/g, '') // Remove potential XSS chars
            .substring(0, maxLength);
    }

    public static sanitizeArrayOfStrings(arr: string[], maxLength: number, maxItems: number): string[] {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(item => typeof item === 'string' && item.trim().length > 0)
            .map(item => this.sanitizeString(item, maxLength))
            .slice(0, maxItems); // Limit array size
    }

    public static sanitizeArrayOrObject(data: any): any {
        if (!data) return '';
        if (Array.isArray(data) && data.length) {
            return data.map(item => this.sanitizeArrayOrObject(item));
        }
        if (typeof data === 'object') {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = this.sanitizeArrayOrObject(data[key]);
                }
            }
            return data;
        }
        if (typeof data === "string") {
            // Check if it's a valid date string
            const str = this.sanitizeString(data, 1000);
            // if (!str) throw new Error("Not allowed");
            return str || '';
        }
        return data;
    }
}