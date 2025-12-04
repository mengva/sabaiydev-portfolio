import { env } from '@/server/config/env';
import { v2 as cloudinary } from 'cloudinary';
import type { FileDto } from '@/server/packages/types/constants';
import { HandlerTRPCError } from './handleTRPCError';
import { ValidationSecureFileUploadServices } from '@/server/packages/utils/secureFile';

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

export interface ImageFileDto {
    files: FileDto[];
}

export class SecureFileUploadServices {

    private static async validationFileAndUploadFunc(file: FileDto, callback: (file: FileDto) => Promise<CLOUDINARY_DTO | any>): Promise<ResponseFileDto> {
        try {
            const validationFile = ValidationSecureFileUploadServices.validationFile(file);
            if (!validationFile.valid) {
                throw new Error(validationFile.error);
            }
            const result: CLOUDINARY_DTO = await callback(file);
            if (!result) throw new Error(`Falied to uploaded File`);
            return {
                imageUrl: result.secure_url,
                size: +result.bytes,
                type: result.resource_type,
                width: +result.width,
                height: +result.height,
                cloudinaryId: result.public_id
            };
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async uploadCloudinaryImageFiles(files: FileDto[]) {
        try {
            if (!files.length) return [];

            const resultFiles = await Promise.all(
                files.map(async (file) => {
                    return await this.validationFileAndUploadFunc(file, this.uploadCloudinaryImageFunc);
                })
            );
            return resultFiles;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async uploadCloudinaryImageFile(file: FileDto) {
        try {
            if (!file) return undefined;

            const resultFile = await this.validationFileAndUploadFunc(file, this.uploadCloudinaryImageFunc);
            return resultFile;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async uploadCloudinaryPDFFile(file: FileDto) {
        try {
            if (!file) return undefined;

            const resultFile = await this.validationFileAndUploadFunc(file, this.uploadCloudinaryPDFFileFunc);
            return resultFile;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async uploadCloudinaryPDFFiles({ files }: ImageFileDto) {
        try {
            if (!files.length) return [];

            const resultFiles = await Promise.all(
                files.map(async (file) => {
                    return await this.validationFileAndUploadFunc(file, this.uploadCloudinaryPDFFileFunc);
                })
            );
            return resultFiles;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async uploadCloudinaryImageFunc(file: FileDto) {
        const result = await cloudinary.uploader.upload(file.fileData, {
            folder: 'portfolio-sabaiydev',
            public_id: `${Date.now()}-${file.fileName.split('.')[0]}`,
            resource_type: "image",
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            quality: "auto",
            flags: 'sanitize', // Cloudinary sanitization
        });
        return result;
    }

    public static async uploadCloudinaryPDFFileFunc(file: FileDto) {
        const result = await cloudinary.uploader.upload(file.fileData, {
            folder: 'portfolio-sabaiydev',
            public_id: `${Date.now()}-${file.fileName.split('.')[0]}`,
            resource_type: "raw",
            allowed_formats: ['pdf', 'doc', 'docx'],
            quality: 'auto',
            flags: 'sanitize', // Cloudinary sanitization
        });
        return result;
    }

    public static async destoryCloudinaryFunc(cloudinaryId: string, resourceType: 'image' | 'raw' = 'image') {
        try {
            const result = await cloudinary.uploader.destroy(
                cloudinaryId,
                { resource_type: resourceType }
            );
            return result;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }
}