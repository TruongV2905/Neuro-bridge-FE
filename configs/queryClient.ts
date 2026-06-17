import { QueryClient } from "@tanstack/react-query";
// 1. Khởi tạo QueryClient bên ngoài component để tránh re-create khi App re-render
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
