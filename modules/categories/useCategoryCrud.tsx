// "use client";

// import type { CategoryResponse } from "@/types/category.types";
// import type { CategorySchema } from "@/schemas/category.schema";
// import type { UseCrudHook, UseCrudParams } from "@/types/dasboard";

// import {
//   useCreateCategory,
//   useCreateCategoriesByFile,
//   useDeleteCategory,
//   useGetAllCategoriesForAdmin,
//   useUpdateCategory,
// } from "@/services/category.service";

// export const useCategoryCrud: UseCrudHook<CategoryResponse, CategorySchema> = (
//   params: UseCrudParams,
// ) => {
//   const {
//     data: categoriesResponse,
//     isLoading,
//     isFetching,
//     error,
//     refetch,
//   } = useGetAllCategoriesForAdmin({
//     page: params.page,
//     size: params.size,
//     search: params.search,
//     sortBy: params.sortBy,
//     direction: params.sortDirection,
//   });

//   const createCategoryMutation = useCreateCategory();
//   const updateCategoryMutation = useUpdateCategory();
//   const toggleCategoryMutation = useDeleteCategory();
//   const importCategoriesMutation = useCreateCategoriesByFile();

//   const categories = categoriesResponse?.result;

//   return {
//     data: categories?.data ?? [],
//     totalItems: categories?.metadata?.totalElements ?? 0,
//     totalPages: categories?.metadata?.totalPages ?? 1,

//     loading:
//       isLoading ||
//       isFetching ||
//       createCategoryMutation.isPending ||
//       updateCategoryMutation.isPending ||
//       toggleCategoryMutation.isPending ||
//       importCategoriesMutation.isPending,

//     error: error?.message ?? null,

//     refresh: async () => {
//       await refetch();
//     },

//     createItem: async (values) => {
//       await createCategoryMutation.mutateAsync({
//         data: {
//           categoryName: values.categoryName,
//           categoryDescription: values.categoryDescription,
//         },
//       });
//     },

//     updateItem: async (record, values) => {
//       await updateCategoryMutation.mutateAsync({
//         pathParams: {
//           id: record.id,
//         },
//         data: {
//           categoryName: values.categoryName,
//           categoryDescription: values.categoryDescription,
//         },
//       });
//     },

//     importItems: async (file) => {
//       const formData = new FormData();
//       formData.append("file", file);

//       await importCategoriesMutation.mutateAsync({
//         data: formData,
//       });
//     },

//     handlers: {
//       activateCategory: async (record) => {
//         if (!record.deleted) return;

//         await toggleCategoryMutation.mutateAsync({
//           pathParams: {
//             id: record.id,
//           },
//         });
//       },

//       inactiveCategory: async (record) => {
//         if (record.deleted) return;

//         await toggleCategoryMutation.mutateAsync({
//           pathParams: {
//             id: record.id,
//           },
//         });
//       },
//     },
//   };
// };