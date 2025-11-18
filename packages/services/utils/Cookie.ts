import Cookies from "js-cookie";

class CookieHelper {

    public static maxAgeCookie = 1000 * 60 * 60 * 24; //1d
    public static isProduction = process.env.NODE_ENV === 'production';

    public static getCookieByKey(key: string) {
        return Cookies.get(key);
    }

    public static getCurrentDate() {
        // Get the current date and time
        return new Date(Date.now()) as Date;
    }

    public static setCurrentDate(day: number) {
        return new Date(Date.now() + day);
    }

    public static setMaxAgeCookie(day: number) {
        return this.maxAgeCookie * day;
    }

    public static setCookieByKey(key: string, value: string, day: number) {
        const maxAgeCookie = this.setMaxAgeCookie(day ?? 1) as number;
        const expiredDate = this.setCurrentDate(maxAgeCookie) as Date;
        Cookies.set(key, value, { expires: expiredDate });
    }

    public static removeCookieByKey(key: string) {
        Cookies.remove(key);
    }

}

export default CookieHelper;