export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  currentPage?: number;
  totalPages?: number;
  data?: T;
  message?: string;
  error?: string;
}
