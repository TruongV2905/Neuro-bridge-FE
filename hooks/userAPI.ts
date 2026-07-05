/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "../configs/api";
import { APIResponse, PageResponse } from "@/types/common.starter";

type ApiError = AxiosError<APIResponse<null>>;
type MutationMethod = "POST" | "PUT" | "PATCH" | "DELETE";
type Params = Record<string, any>;
type MutationPayload<TVariables> = {
  pathParams?: Params;
  data?: TVariables;
};

const toQueryKey = (key: string | QueryKey): QueryKey => {
  return Array.isArray(key) ? key : [key];
};

const resolveUrl = (url: string, params?: Params) => {
  if (!params) return { finalUrl: url, remainingParams: {} };

  const remainingParams = { ...params };
  let finalUrl = url;

  Object.keys(params).forEach((key) => {
    if (finalUrl.includes(`:${key}`)) {
      finalUrl = finalUrl.replace(
        `:${key}`,
        encodeURIComponent(String(params[key])),
      );

      delete remainingParams[key];
    }
  });

  return { finalUrl, remainingParams };
};

// 2. GET HOOK
export const createQueryHook = <TData = unknown>(
  queryKey: string | QueryKey,
  url: string,
) => {
  return function useCustomQuery(
    params?: Params,
    options?: Omit<
      UseQueryOptions<
        APIResponse<TData>,
        ApiError,
        APIResponse<TData>,
        QueryKey
      >,
      "queryKey" | "queryFn"
    >,
  ) {
    const baseKey = toQueryKey(queryKey);

    return useQuery<APIResponse<TData>, ApiError, APIResponse<TData>, QueryKey>(
      {
        queryKey: params ? [...baseKey, params] : baseKey,

        queryFn: async () => {
          const { finalUrl, remainingParams } = resolveUrl(url, params);

          const { data } = await api.get<APIResponse<TData>>(finalUrl, {
            params: remainingParams,
          });

          return {
            result: data.result,
            message: data.message,
            code: data.code,
          };
        },

        retry: 0,
        ...options,
      },
    );
  };
};

// 3. MUTATION HOOK

type CreateMutationHookConfig<TResponse, TVariables> = {
  url: string;
  method?: MutationMethod;
  queryKeyToInvalidate?: string | QueryKey | Array<string | QueryKey>;
  isMultipart?: boolean;
  options?: Omit<
    UseMutationOptions<
      APIResponse<TResponse>,
      ApiError,
      MutationPayload<TVariables>,
      unknown
    >,
    "mutationFn"
  >;
};

export const createMutationHook = <TResponse = unknown, TVariables = unknown>({
  url,
  method = "POST",
  queryKeyToInvalidate,
  isMultipart = false,
  options,
}: CreateMutationHookConfig<TResponse, TVariables>) => {
  return function useCustomMutation() {
    const queryClient = useQueryClient();

    return useMutation<
      APIResponse<TResponse>,
      ApiError,
      MutationPayload<TVariables>,
      unknown
    >({
      ...options,

      mutationFn: async ({ pathParams, data }) => {
        const { finalUrl, remainingParams } = resolveUrl(url, pathParams);
        const config: AxiosRequestConfig = {
          method,
          url: finalUrl,
          data,
          params: remainingParams,
        };
        if (isMultipart && config.headers) {
          delete config.headers["Content-Type"];
        }
        const res = await api<APIResponse<TResponse>>(config);

        return {
          result: res.data.result,
          message: res.data.message,
          code: res.data.code,
        };
      },

      onSuccess: async (data, variables, onMutateResult, context) => {
        if (queryKeyToInvalidate) {
          const keys = Array.isArray(queryKeyToInvalidate)
            ? queryKeyToInvalidate
            : [queryKeyToInvalidate];

          await Promise.all(
            keys.map((key) =>
              queryClient.invalidateQueries({
                queryKey: toQueryKey(key),
                exact: false,
                refetchType: "all",
              }),
            ),
          );
        }

        options?.onSuccess?.(data, variables, onMutateResult, context);
      },

      onError: (error, variables, onMutateResult, context) => {
        options?.onError?.(error, variables, onMutateResult, context);
      },

      onSettled: (data, error, variables, onMutateResult, context) => {
        options?.onSettled?.(data, error, variables, onMutateResult, context);
      },
    });
  };
};

export const createPostQueryHook = <TData = unknown, TVariables = unknown>(
  queryKey: string | QueryKey,
  url: string,
) => {
  return function useCustomPostQuery(
    body: TVariables,
    options?: Omit<
      UseQueryOptions<
        APIResponse<TData>,
        ApiError,
        APIResponse<TData>,
        QueryKey
      >,
      "queryKey" | "queryFn"
    >,
  ) {
    const baseKey = toQueryKey(queryKey);

    return useQuery<APIResponse<TData>, ApiError, APIResponse<TData>, QueryKey>(
      {
        queryKey: [...baseKey, body],

        queryFn: async () => {
          const res = await api.post<APIResponse<TData>>(url, body);

          return {
            result: res.data.result,
            message: res.data.message,
            code: res.data.code,
          };
        },

        retry: 0,
        ...options,
      },
    );
  };
};


export const createInfiniteQueryHook = <TItem = unknown>(
  queryKey: string | QueryKey,
  url: string,
) => {
  return function useCustomInfiniteQuery(
    params?: Omit<Params, "page"> & {
      page?: number;
      size?: number;
      search?: string;
      sortBy?: string;
      direction?: "ASCENDING" | "DESCENDING";
    },
    options?: Omit<
      UseInfiniteQueryOptions<
        APIResponse<PageResponse<TItem>>,
        ApiError,
        InfiniteData<APIResponse<PageResponse<TItem>>>,
        QueryKey,
        number
      >,
      "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
    >,
  ) {
    const baseKey = toQueryKey(queryKey);

    const {
      page: _pageIgnored,
      size = 20,
      search = "",
      sortBy = "createdAt",
      direction = "ASCENDING",
      ...restParams
    } = params ?? {};
    void _pageIgnored;

    return useInfiniteQuery<
      APIResponse<PageResponse<TItem>>,
      ApiError,
      InfiniteData<APIResponse<PageResponse<TItem>>>,
      QueryKey,
      number
    >({
      queryKey: [
        ...baseKey,
        "infinite",
        {
          ...restParams,
          size,
          search,
          sortBy,
          direction,
        },
      ],

      initialPageParam: 0,

      queryFn: async ({ pageParam }) => {
        const finalParams = {
          ...restParams,
          page: pageParam,
          size,
          search,
          sortBy,
          direction,
        };

        const { finalUrl, remainingParams } = resolveUrl(url, finalParams);

        const { data } = await api.get<APIResponse<PageResponse<TItem>>>(
          finalUrl,
          {
            params: remainingParams,
          },
        );

        return {
          result: data.result,
          message: data.message,
          code: data.code,
        };
      },

      getNextPageParam: (lastPage) => {
        const metadata = lastPage.result.metadata;

        const nextPage = metadata.page + 1;

        if (nextPage >= metadata.totalPages) {
          return undefined;
        }

        return nextPage;
      },

      retry: 0,
      ...options,
    });
  };
};


//Cách sử dụng:
// export const useGetUsers = createQueryHook<UserResponse[]>(
//   ["users"],
//   "/users"
// );

// 1. Tạo hook GET có danh sách
// const { data, isLoading, error } = useGetUsers();

// 2. Tạo hook GET có query params
// const { data } = useGetUsers({
//   page: 1,
//   size: 10,
//   keyword: "quang",
// });

//3. Tạo hook GET detail có path param

// export const useGetUserById = createQueryHook<UserResponse>(
//   ["users", "detail"],
//   "/users/:id"
// );
