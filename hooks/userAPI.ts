/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import type { AxiosRequestConfig} from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import api from "../configs/api";

// 1. Helper thông minh: Tách biệt path params và query params
const resolveUrl = (url: string, params?: Record<string, any>) => {
  if (!params) return { finalUrl: url, remainingParams: {} };
  
  const remainingParams = { ...params };
  let finalUrl = url;
  
  Object.keys(params).forEach((key) => {
    if (finalUrl.includes(`:${key}`)) {
      finalUrl = finalUrl.replace(`:${key}`, encodeURIComponent(params[key]));
      delete remainingParams[key]; // Xóa khỏi query string vì đã dùng trong path
    }
  });
  
  return { finalUrl, remainingParams };
};

// 2. GET HOOK
export const createQueryHook = <TData = any>(
  queryKey: string | any[], 
  url: string
) => (
  params?: Record<string, any>, 
  options?: Partial<UseQueryOptions<TData, AxiosError<{ message: string }>>>
) => {
  const baseKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery({
    // Cache key phân tách rõ ràng
    queryKey: params ? [...baseKey, params] : baseKey,
    queryFn: async () => {
      const { finalUrl, remainingParams } = resolveUrl(url, params);
      const { data } = await api.get(finalUrl, { params: remainingParams });
      return data;
    },
    retry: 0,
    // Cho phép override các options như staleTime, gcTime...
    ...options as any, 
  });
};

// 3. MUTATION HOOK
type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const createMutationHook = <TResponse = any, TVariables = any>(
  queryKeyToInvalidate: string | any[],
  url: string,
  method: MutationMethod = 'POST',
  isMultipart = false
) => () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pathParams, data }: { pathParams?: Record<string, any>, data?: TVariables }) => {
      const { finalUrl } = resolveUrl(url, pathParams);
      const config: AxiosRequestConfig = {
        method,
        url: finalUrl,
        data,
        headers: isMultipart ? { "Content-Type": "multipart/form-data" } : {},
      };
      const res = await api(config);
      return res.data as TResponse;
    },
    onSuccess: () => {
      // Invalidate toàn bộ các query liên quan (VD: 'products' sẽ invalidate cả 'products' có params)
      const baseKey = Array.isArray(queryKeyToInvalidate) ? queryKeyToInvalidate : [queryKeyToInvalidate];
      queryClient.invalidateQueries({ queryKey: baseKey });
    },
  });
};