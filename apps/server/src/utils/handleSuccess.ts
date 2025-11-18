export class HandlerSuccess {
    public static success(message: string, data: any = {}) {
        return {
            success: true,
            message,
            data
        }
    }
}