import toast from "react-hot-toast";
import type { FileDto } from "../types/constants";
import { validateMaxFileSize } from "./constants";
import { ValidationSecureFileUploadServices } from "./SecureFile";
import { ErrorHandler } from "./HandleError";

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

    public static async uploadFile(file: File): Promise<FileDto | undefined> {
        if (!file) return undefined;
        const validFile = file.size <= validateMaxFileSize;
        if (!validFile) {
            return undefined;
        }
        return await this.uploadFile(file);
    }

    public static async uploadFiles(files: File[]): Promise<FileDto[] | undefined> {
        try {
            if (files.length === 0) return [];

            // check max file size
            const validFiles = files.filter(file => file.size <= validateMaxFileSize);

            // convert file 
            const resultFiles = await Promise.all(validFiles.map(async file => await this.uploadFileFunc(file)));

            // validation file
            const validationFormattedFiles = await ValidationSecureFileUploadServices.ValidationFiles(resultFiles);

            const findErrorMessage = validationFormattedFiles.find(file => file.valid && file.error);

            if (findErrorMessage) {
                toast.error(findErrorMessage.error || "Invalid file formatted");
                return undefined;
            }

            return resultFiles as FileDto[];
        } catch (error) {
            const message = ErrorHandler.getErrorMessage(error);
            throw new Error(message);
        }
    }
}