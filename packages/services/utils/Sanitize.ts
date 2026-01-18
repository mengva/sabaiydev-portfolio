export class SecureSanitizeServices {
    private static isValidDateString(str: string): boolean {
        const date = new Date(str);
        return !isNaN(date.getTime());
    }

    public static sanitizedString(str: string, maxLength: number): string {
        if (typeof str !== 'string') return '';
        return str
            .trim()
            .replace(/[<><>'"&]/g, '') // Remove potential XSS chars
            .substring(0, maxLength);
    }

    public static sanitizedArrayOfStrings(arr: string[], maxLength: number, maxItems: number): string[] {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(item => typeof item === 'string' && item.trim().length > 0)
            .map(item => this.sanitizedString(item, maxLength))
            .slice(0, maxItems); // Limit array size
    }

    public static sanitizedArrayOrObject(data: any): any {
        if (!data) return '';

        const keys: string[] = Object.keys(data);
        const imageFileKeys: string[] = ["fileName", "fileType", "fileData", "size"];
        const isValidImageFile = Boolean(
            keys && 
            keys.length && 
            imageFileKeys.every(key => imageFileKeys.includes(key)) 
            && keys.length === imageFileKeys.length
        );

        if (isValidImageFile) {
            return data;
        }

        if (Array.isArray(data) && data.length) {
            return data.map(item => this.sanitizedArrayOrObject(item));
        }


        if (typeof data === 'object' && Object.keys(data).length) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = this.sanitizedArrayOrObject(data[key]);
                }
            }
            return data;
        }

        if (typeof data === "string") {
            // Check if it's a valid date string
            const str = this.sanitizedString(data, 1000);
            // if (!str) throw new Error("Not allowed");
            return str || '';
        }

        return data;
    }
}