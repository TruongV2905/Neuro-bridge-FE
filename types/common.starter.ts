export type APIResponse<T> = {
  code: number;
  message: string;
  result: T;
};
export type Metadata = {
  page: number;
  size: number;
  currentElements: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
export type PageRequest = {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: "ASCENDING" | "DESCENDING";
  search?: string;
};
export type PageResponse<T> = {
  data: T[];
  metadata: Metadata;
};
