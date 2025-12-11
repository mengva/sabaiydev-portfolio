import type { FileDto } from "../types/constants";
import { ValidationSecureFileUploadServices } from "./secureFile";
import { ErrorHandler } from "./handleError";
import { validateMaxFileSize } from "./constants/variables";

interface UploadFileDto {
    message: string;
    file: FileDto | undefined;
    error: boolean;
}

interface UploadFilesDto {
    message: string;
    files: FileDto[];
    error: boolean;
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
            file: undefined,
            error: true,
        };

        const validFile = file.size > validateMaxFileSize;

        if (validFile) {
            return {
                message: "Can't uploaded file size > 10MB",
                file: undefined,
                error: true,
            };
        }

        const resultFile = await this.uploadFileFunc(file);
        const validationFile = ValidationSecureFileUploadServices.validationFile(resultFile);

        if (validationFile.error) {
            return {
                message: validationFile.error || "Invalid file formatted",
                file: undefined,
                error: true,
            };
        }

        const res = await this.uploadFileFunc(file);
        return {
            message: "",
            file: res,
            error: false,
        }
    }

    public static async uploadFiles(files: File[]): Promise<UploadFilesDto> {
        try {
            if (files.length === 0) return {
                message: "Files is required",
                files: [],
                error: true,
            }

            // check max file size
            const validFiles = files.filter(file => file.size <= validateMaxFileSize);

            // convert file 
            const resultFiles = await Promise.all(validFiles.map(async file => await this.uploadFileFunc(file)));

            // validation file
            const errorMessage = await ValidationSecureFileUploadServices.validationFiles(resultFiles);

            if (errorMessage) {
                return {
                    message: errorMessage || "Invalid file formatted",
                    files: [],
                    error: true,
                };
            }

            return {
                message: "",
                files: resultFiles as FileDto[],
                error: false
            }
        } catch (error) {
            const message = ErrorHandler.getErrorMessage(error);
            throw new Error(message);
        }
    }
}