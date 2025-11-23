import { env } from '@/api/config/env';
import { v2 as cloudinary } from 'cloudinary';
import type { FileDto } from '@/api/packages/types/constants';
import { HandlerTRPCError } from './handleTRPCError';
import { ValidationSecureFileUploadServices } from '@/api/packages/utils/SecureFile';

cloudinary.config({
    cloud_name: env('CLOUDINARY_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_SECRET'),
});

interface CLOUDINARY_DTO {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: Date;
    tags: any[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    asset_folder: string;
    display_name: string;
    api_key: string;
}

export interface ResponseFileDto {
    imageUrl: string;
    size: number;
    type: string;
    width: number;
    height: number;
    cloudinaryId: string;
}

export class SecureFileUploadServices {

    private static async ValidationFileAndUpload({ file, isPDF }: { file: FileDto; isPDF: boolean }): Promise<ResponseFileDto> {
        const validation = ValidationSecureFileUploadServices.ValidationFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        const result = isPDF ? await this.uploadPDFFileCloudinary(file) : await this.uploadImageCloudinary(file);
        if (!result) throw new Error(`Falied to uploaded ${isPDF ? 'PDF file' : 'file'}`);
        return {
            imageUrl: result.secure_url,
            size: +result.bytes,
            type: result.resource_type,
            width: +result.width,
            height: +result.height,
            cloudinaryId: result.public_id
        };
    }

    public static async uploadFileToCloudinary({ files }: {
        files: FileDto[] | FileDto;
    }) {
        if (Array.isArray(files) && files.length > 0) {
            const uploadResults = await Promise.all(
                files.map(async (file) => {
                    return await this.ValidationFileAndUpload({ file, isPDF: false });
                })
            );
            return uploadResults;
        } else if (!Array.isArray(files)) {
            return await this.ValidationFileAndUpload({ file: files as FileDto, isPDF: false });
        }
    }

    public static async uploadPDFFileToCloudinary({
        files }: {
            files: FileDto[] | FileDto;
        }) {
        if (Array.isArray(files) && files.length > 0) {
            const uploadResults = await Promise.all(
                files.map(async (file) => {
                    return await this.ValidationFileAndUpload({ file, isPDF: true });
                })
            );
            return uploadResults;
        } else {
            return await this.ValidationFileAndUpload({ file: files as FileDto, isPDF: true });
        }
    }

    public static async uploadImageCloudinary(file: File | any) {
        const result = await cloudinary.uploader.upload(file.fileData, {
            folder: 'sabaiydev_portfolio',
            public_id: `${Date.now()}-${file.fileName.split('.')[0]}`,
            resource_type: "image",
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            quality: "auto",
            flags: 'sanitize', // Cloudinary sanitization
        });
        return result;
    }

    public static async uploadPDFFileCloudinary(file: File | any) {
        const result = await cloudinary.uploader.upload(file.fileData, {
            folder: 'sabaiydev_portfolio',
            public_id: `${Date.now()}-${file.fileName.split('.')[0]}`,
            resource_type: "raw",
            allowed_formats: ['pdf', 'doc', 'docx'],
            quality: 'auto',
            flags: 'sanitize', // Cloudinary sanitization
        });
        return result;
    }

    public static async destoryCloudinaryImage(cloudinaryId: string) {
        try {
            const result = await cloudinary.uploader.destroy(
                cloudinaryId,
                { resource_type: 'sabaiydev_portfolio' }
            );
            return result;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }
}