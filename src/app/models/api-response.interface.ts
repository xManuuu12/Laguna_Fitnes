export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data?: T;
  message?: string;
  error?: string;
}
