import type { FileDto } from "../types/constants";

export class UploadFileServices {

    public static async uploadFile(file: File): Promise<FileDto> {
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

    public static async uploadFiles(files: File[]): Promise<FileDto[]> {
        if(files.length === 0) return [];
        const fileDatas = await Promise.all(files.map(async file => await this.uploadFile(file)));
        return fileDatas as FileDto[];
    }
}