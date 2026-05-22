export class ErrorHandler {
  static handle(error: any, context?: string) {
    console.error(`Error in ${context || 'application'}:`, error);
    return error?.message || 'An unexpected error occurred';
  }

  static handleAPIError(error: any, fallback = 'Request failed') {
    return error?.message || fallback;
  }

  static validateInput(value: string, type: 'email' | 'phone' | 'text'): boolean {
    if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (type === 'phone') return /^[\d\s\+\-]{7,15}$/.test(value);
    return value.trim().length > 0;
  }

  static logError(error: any, context?: string) {
    console.error(`[${new Date().toISOString()}] Error in ${context}:`, error);
  }
}