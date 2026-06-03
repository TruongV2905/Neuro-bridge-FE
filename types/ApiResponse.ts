export type APIResponse<T> = {
  code: number;
  message: string;
  result: T;
};
