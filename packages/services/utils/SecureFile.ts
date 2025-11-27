import type { FileDto } from "../types/constants";
import { validateMaxFileSize } from "./constants";

export class ValidationSecureFileUploadServices {

    public static readonly IMAGE_FILE_TYPE = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

    public static readonly ALLOWED_PDF_FILE_SIGNATURES = {
        '25504446': 'application/pdf', // PDF file
    };

    public static readonly ALLOWED_IMAGE_FILE_SIGNATURES = {
        'ffd8ff': 'image/jpeg',      // JPEG file
        '89504e': 'image/png',       // PNG file
        '474946': 'image/jpg',       // GIF signature but mapped to jpg
        '52494646': 'image/webp',    // WEBP file
    };

    public static readonly ALLOWED_FILE_SIGNATURES = {
        ...this.ALLOWED_PDF_FILE_SIGNATURES,
        ...this.ALLOWED_IMAGE_FILE_SIGNATURES,
    };

    public static validationFile(file: FileDto): { valid: boolean; error?: string } {
        if (file.size > validateMaxFileSize) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }
        // ตรวจสอบ file signature
        const base64Data = file.fileData.split(',')[1] || '';
        const buffer = Buffer.from(base64Data, 'base64');
        const signature = buffer.toString('hex', 0, 8).toLowerCase();
        let isValidImage = false;
        for (const [sig, type] of Object.entries(this.ALLOWED_FILE_SIGNATURES)) {
            if (signature.startsWith(sig)) {
                isValidImage = true;
                break;
            }
        }
        if (!isValidImage) {
            return { valid: false, error: 'Invalid file type' };
        }
        return { valid: true };
    }

    public static async validationFiles(files: FileDto[]) {
        const valids = await Promise.all(
            files.map(file => this.validationFile(file))
        )
        return valids;
    }

}

// import type { FileDto } from "../types/constants";
// import { validateMaxFileSize } from "./constants";

// export class ValidationSecureFileUploadServices {

//     public static readonly IMAGE_FILE_TYPE = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

//     public static readonly ALLOWED_PDF_FILE_SIGNATURES = {
//         '25504446': 'application/pdf', // PDF file
//     };

//     public static readonly ALLOWED_IMAGE_FILE_SIGNATURES = {
//         'ffd8ff': 'image/jpeg',      // JPEG file
//         '89504e47': 'image/png',     // PNG file (fixed - added full signature)
//         '474946': 'image/gif',       // GIF file (fixed - should be image/gif, not jpg)
//         '52494646': 'image/webp',    // WEBP file
//     };

//     public static readonly ALLOWED_FILE_SIGNATURES = {
//         ...this.ALLOWED_PDF_FILE_SIGNATURES,
//         ...this.ALLOWED_IMAGE_FILE_SIGNATURES,
//     };

//     public static ValidationFile(file: FileDto): { valid: boolean; error?: string } {
//         // Check file size
//         if (file.size > validateMaxFileSize) {
//             return { valid: false, error: 'File size exceeds 10MB limit' };
//         }

//         // Validate buffer exists
//         if (!file.buffer || file.buffer.length === 0) {
//             return { valid: false, error: 'File buffer is empty' };
//         }

//         // Check file signature from buffer (not fileData which doesn't exist in FileDto)
//         const signature = file.buffer.toString('hex', 0, 8).toLowerCase();

//         let isValidFile = false;
//         for (const [sig, type] of Object.entries(this.ALLOWED_FILE_SIGNATURES)) {
//             if (signature.startsWith(sig)) {
//                 isValidFile = true;
//                 break;
//             }
//         }

//         if (!isValidFile) {
//             return { valid: false, error: 'Invalid file type' };
//         }

//         return { valid: true };
//     }

//     public static async ValidationFiles(files: FileDto[]) {
//         const valids = await Promise.all(
//             files.map(file => this.ValidationFile(file))
//         );
//         return valids;
//     }
// }