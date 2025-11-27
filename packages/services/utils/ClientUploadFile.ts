import type { FileDto } from "../types/constants";
import { validateMaxFileSize } from "./constants";
import { ValidationSecureFileUploadServices } from "./SecureFile";
import { ErrorHandler } from "./HandleError";

interface UploadFileDto {
    message: string;
    file: FileDto | undefined;
}

interface UploadFilesDto {
    message: string;
    files: FileDto[];
}

export class UploadFileServices {

    public static async uploadFileFunc(file: File): Promise<FileDto> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                if (e.target?.result) {
                    return resolve({
                        fileData: e.target.result as string,
                        fileName: file.name,
                        fileType: file.type,
                        size: file.size
                    } as FileDto)
                } else {
                    reject("File read failed");
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    public static async uploadFile(file: File): Promise<UploadFileDto> {

        if (!file) return {
            message: "File is required",
            file: undefined
        };

        const validFile = file.size <= validateMaxFileSize;

        if (!validFile) {
            return {
                message: "Can't uploaded file size > 10MB",
                file: undefined
            };
        }

        const resultFile = await this.uploadFileFunc(file);
        const validationFormattedFile = ValidationSecureFileUploadServices.validationFile(resultFile);

        if (validationFormattedFile.error) {
            return {
                message: validationFormattedFile.error || "Invalid file formatted",
                file: undefined
            };
        }

        const res = await this.uploadFileFunc(file);
        return {
            message: "success",
            file: res
        }
    }

    public static async uploadFiles(files: File[]): Promise<UploadFilesDto> {
        try {
            if (files.length === 0) return {
                message: "Files is required",
                files: []
            }

            // check max file size
            const validFiles = files.filter(file => file.size <= validateMaxFileSize);

            // convert file 
            const resultFiles = await Promise.all(validFiles.map(async file => await this.uploadFileFunc(file)));

            // validation file
            const validationFormattedFiles = await ValidationSecureFileUploadServices.validationFiles(resultFiles);

            const findErrorMessage = validationFormattedFiles.find(file => file.valid && file.error);

            if (findErrorMessage) {
                return {
                    message: findErrorMessage.error || "Invalid file formatted",
                    files: []
                };
            }

            return {
                message: "success",
                files: resultFiles as FileDto[]
            }
        } catch (error) {
            const message = ErrorHandler.getErrorMessage(error);
            throw new Error(message);
        }
    }
}