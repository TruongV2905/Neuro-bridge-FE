// "use client"

// import type { CategoryResponse } from "@/types/category.types"
// import type { CategorySchema } from "@/schemas/category.schema"
// import type { UseCrudHook, UseCrudParams } from "@/types/dasboard"

// import {
//   useCreateCategory,
//   useDeleteCategory,
//   useGetAllCategories,
//   useUpdateCategory,
// } from "@/services/category.service"

// export const useCategoryCrud: UseCrudHook<CategoryResponse, CategorySchema> = (
//   params: UseCrudParams,
// ) => {
//   const {
//     data: categoriesResponse,
//     isLoading,
//     isFetching,
//     error,
//     refetch,
//   } = useGetAllCategories({
//     page: params.page,
//     size: params.size,
//     search: params.search,
//     sortBy: params.sortBy,
//     direction: params.sortDirection,
//   })

//   const createCategoryMutation = useCreateCategory()
//   const updateCategoryMutation = useUpdateCategory()
//   const deleteCategoryMutation = useDeleteCategory()

//   const categories = categoriesResponse?.result

//   return {
//     data: categories?.data ?? [],
//     totalItems: categories?.metadata?.totalElements ?? 0,
//     totalPages: categories?.metadata?.totalPages ?? 1,

//     loading:
//       isLoading ||
//       isFetching ||
//       createCategoryMutation.isPending ||
//       updateCategoryMutation.isPending ||
//       deleteCategoryMutation.isPending,

//     error: error?.message ?? null,

//     refresh: async () => {
//       await refetch()
//     },

//     createItem: async (values) => {
//       await createCategoryMutation.mutateAsync({
//         data: {
//           name: values.name,
//           description: values.description,
//         },
//       })
//     },

//     updateItem: async (record, values) => {
//       await updateCategoryMutation.mutateAsync({
//         pathParams: {
//           id: record.categoryId,
//         },
//         data: {
//           name: values.name,
//           description: values.description,
//         },
//       })
//     },

//     deleteItem: async (record) => {
//       await deleteCategoryMutation.mutateAsync({
//         pathParams: {
//           id: record.categoryId,
//         },
//       })
//     },

//     handlers: {},
//   }
// }