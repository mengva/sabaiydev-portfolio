import { TRPCClientError } from '@trpc/client';
import toast from 'react-hot-toast';
import { ZodError } from 'zod';

export class ErrorHandler {
  public static handleError(error: unknown) {
    let message = '';

    if (error instanceof TRPCClientError) {
      // TRPC errors can have nested data with additional context
      message = this.handleTRPCError(error);
    } else if (error instanceof ZodError) {
      // Format validation errors in a user-friendly way
      message = this.handleZodError(error);
    } else if (error instanceof Error) {
      // Handle standard JavaScript errors
      message = error.message;
    } else {
      // Fallback for unknown error types
      message = "An unexpected error occurred.";
    }
    return message;

  }

  public static handleClientError(error: unknown) {
    const message = ErrorHandler.getErrorMessage(error);
    return toast.error(message || 'Failed Something.');
  }

  public static handleServerError(error: unknown) {
    const message = this.handleError(error);
    return message;
  }

  private static handleTRPCError(error: TRPCClientError<any>): string {
    // TRPC errors often contain more detailed information in the data property
    if (error.data?.zodError) {
      // Handle validation errors that come from TRPC
      return this.handleZodError(error.data.zodError);
    }

    // Check for custom error messages in the data
    if (error.data?.message) {
      return error.data.message;
    }

    // Fall back to the main error message
    return error.message || 'A server error occurred.';
  }

  private static handleZodError(error: ZodError): string {
    // Create user-friendly validation messages
    const messages = error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${this.formatZodMessage(issue)}`;
    });

    const joinMessage = messages.join('\n');

    if (messages && Array.isArray(messages)) {
      const mes = messages[0]?.toString()
      if (mes && mes.includes(":")) {
        const splitMes = mes.split(":");
        if (splitMes && Array.isArray(splitMes)) {
          let message = '';
          for (const mes of splitMes) {
            message += mes;
          }
          return message;
        }
      }
    }
    return joinMessage;

  }

  private static formatZodMessage(issue: any): string {
    // Customize messages based on validation type
    switch (issue.code) {
      case 'invalid_type':
        return `Expected ${issue.expected}, but received ${issue.received}`;
      case 'too_small':
        if (issue.type === 'string') {
          return `Must be at least ${issue.minimum} characters`;
        }
        return `Must be at least ${issue.minimum}`;
      case 'too_big':
        if (issue.type === 'string') {
          return `Must be at most ${issue.maximum} characters`;
        }
        return `Must be at most ${issue.maximum}`;
      case 'invalid_string':
        if (issue.validation === 'email') {
          return 'Please enter a valid email address';
        }
        if (issue.validation === 'url') {
          return 'Please enter a valid URL';
        }
        return issue.message;
      case 'custom':
        return issue.message;
      default:
        return issue.message;
    }
  }

  // Alternative method for getting error message without showing toast
  public static getErrorMessage(error: unknown): string {
    if (error instanceof TRPCClientError) {
      return this.handleTRPCError(error);
    } else if (error instanceof ZodError) {
      return this.handleZodError(error);
    } else if (error instanceof Error) {
      return error.message;
    } else {
      return "An unexpected error occurred.";
    }
  }

  // Method for logging errors while still showing user-friendly messages
  public static handleErrorWithLogging(error: unknown): void {
    // Log the full error for debugging
    console.error('Error occurred:', error);

    // Show user-friendly message
    this.handleError(error);
  }
}