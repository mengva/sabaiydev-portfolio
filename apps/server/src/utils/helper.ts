import * as bcrypt from "bcryptjs"
import * as nodemailer from "nodemailer";
import { env } from "../config/env";
import type { CookieOptionDto, MailOptionDto } from "../types/auth";

export class Helper {

    public static isProduction = process.env.NODE_ENV === 'production'

    public static cookieOption: CookieOptionDto = {
        sameSite: this.isProduction ? 'strict' : 'lax',
        secure: this.isProduction,
        httpOnly: true,
        domain: 'localhost',
        maxAge: 60 * 60 * 24 * 30, // 30d 
        path: '/',
    }

    public static async bcryptHast(code: string) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(code, salt);
        return hashed;
    }

    public static async bcryptCompare(code: string, hashedCode: string) {
        return await bcrypt.compare(code, hashedCode);
    }

    public static generateOTP() {
        // Generate a random 6 digit OTP
        return (Math.floor(100000 + Math.random() * 900000)).toString() as string;
    }

    public static codeExpiredIn(second: number) {
        // Set the OTP code to expire in m minutes
        return new Date(Date.now() + second * 1000) as Date;
    }

    public static currentDate() {
        // Get the current date and time
        return new Date(Date.now()) as Date;
    }

    public static setCurrentDate(day: number) {
        return new Date(Date.now() + day);
    }

    public static transporter() {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env('EMAIL_ADDRESS'),
                pass: env('EMAIL_PASSWORD'),
            },
        });
        return transporter;
    }

    public static mailOptions({ from, to, subject, html }: MailOptionDto) {
        return {
            from,
            to,
            subject,
            html
        }
    }
}