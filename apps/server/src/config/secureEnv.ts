import * as dotenv from "dotenv"

interface SecureEnvDTO {
    PORT: number;
    DATABASE_URL: string;
    CLOUDINARY_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_SECRET: string;
    CLOUDINARY_URL: string;
    ADMIN_SECRET: string;
    SESSION_SECRET: string;
    EMAIL_ADDRESS: string;
    EMAIL_PASSWORD: string;
    CORS_ORIGIN: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

type SecureEnvKey = keyof SecureEnvDTO

dotenv.config()

export class SecureEnv {
    private static requiredVars: SecureEnvKey[] = [
        'PORT',
        'DATABASE_URL',
        'CLOUDINARY_NAME',
        'CLOUDINARY_SECRET',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_SECRET',
        'CLOUDINARY_URL',
        'ADMIN_SECRET',
        'SESSION_SECRET',
        'EMAIL_ADDRESS',
        'EMAIL_PASSWORD',
        'CORS_ORIGIN',
        'NODE_ENV'
    ] as const;

    public static validate() {
        const missing = this.requiredVars.filter(
            varName => !process.env[varName]
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(', ')}\n` +
                'Please check your .env file'
            );
        }

        // ตรวจสอบความแข็งแรงของ secrets
        const secrets = ['ADMIN_SECRET', 'SESSION_SECRET'];
        for (const secret of secrets) {
            const value = process.env[secret]!;
            if (value.length < 32) {
                throw new Error(`${secret} must be at least 32 characters long`);
            }
        }
    }

    public static get(key: SecureEnvKey): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} is not set`);
        }
        return value;
    }
}