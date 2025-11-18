export interface CookieOptionDto {
    sameSite: string;
    secure: boolean;
    httpOnly: boolean;
    domain: string;
    maxAge: number;
    path: string;
}

export interface MailOptionDto {
    from: string;
    to: string;
    subject: string;
    html: string;
}