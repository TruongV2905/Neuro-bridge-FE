// "use client"

// import { useMemo, useState } from "react"
// import type { ComponentType } from "react"

// import type { CrudConfig } from "@/types/crud"

// import PageWrapper from "@/components/common/PageWrapper"
// import { DataTable } from "@/components/dashboard/table/DataTable"
// import { TablePagination } from "@/components/dashboard/table/TablePagination"
// import { CrudModal } from "./CrudModal"
// import { CrudToolbar } from "./CrudToolbar"

// export type CrudFormMode = "create" | "edit"

// export type CrudFormProps<TData extends object> = {
//   mode?: CrudFormMode
//   defaultValues?: Partial<TData>
//   onSubmit?: (values: TData) => void | Promise<void>
//   onCancel?: () => void
//   submitLabel?: string
//   isSubmitting?: boolean
// }

// type CrudPageProps<TData extends object> = {
//   config: CrudConfig<TData>
//   Form: ComponentType<CrudFormProps<TData>>
// }

// type SortDirection = "asc" | "desc"

// const getRecordValue = <TData extends object>(
//   record: TData,
//   key: string,
// ): unknown => {
//   return (record as Record<string, unknown>)[key]
// }

// const getSortableValue = <TData extends object>(
//   record: TData,
//   key: string,
// ): string => {
//   const recordMap = record as Record<string, unknown>

//   /**
//    * Cột "user" là cột custom, không tồn tại trực tiếp trong data.
//    * Với User Management, mình sort theo fullName.
//    */
//   if (key === "user") {
//     return String(recordMap.fullName ?? recordMap.name ?? "")
//   }

//   return String(recordMap[key] ?? "")
// }

// export function CrudPage<TData extends object>({
//   config,
//   Form,
// }: CrudPageProps<TData>) {
//   const [data, setData] = useState<TData[]>(config.data ?? [])

//   const [editingIndex, setEditingIndex] = useState<number | null>(null)
//   const [selectedRecord, setSelectedRecord] = useState<Partial<TData>>({})
//   const [isOpen, setIsOpen] = useState(false)

//   const [sortKey, setSortKey] = useState<string | null>(null)
//   const [sortDirection, setSortDirection] = useState<SortDirection | null>(
//     null,
//   )
//   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

//   const pageSizeOptions = config.table?.pageSizeOptions ?? [10, 25, 50, 100]

//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(config.table?.pageSize ?? 10)

//   const processedData = useMemo(() => {
//     let result = [...data]

//     Object.entries(columnFilters).forEach(([key, value]) => {
//       if (!value || value === "all") return

//       result = result.filter((item) => {
//         const itemValue = String(getRecordValue(item, key) ?? "")
//         return itemValue === value
//       })
//     })

//     if (sortKey && sortDirection) {
//       result.sort((a, b) => {
//         const aValue = getSortableValue(a, sortKey).toLowerCase()
//         const bValue = getSortableValue(b, sortKey).toLowerCase()

//         if (aValue < bValue) {
//           return sortDirection === "asc" ? -1 : 1
//         }

//         if (aValue > bValue) {
//           return sortDirection === "asc" ? 1 : -1
//         }

//         return 0
//       })
//     }

//     return result
//   }, [data, columnFilters, sortKey, sortDirection])

//   const totalItems = processedData.length
//   const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1)

//   const startIndex = (currentPage - 1) * pageSize
//   const endIndex = startIndex + pageSize

//   const paginatedData = useMemo(() => {
//     return processedData.slice(startIndex, endIndex)
//   }, [processedData, startIndex, endIndex])

//   const startItem = totalItems === 0 ? 0 : startIndex + 1
//   const endItem = Math.min(endIndex, totalItems)

//   const resetModalState = () => {
//     setSelectedRecord({})
//     setEditingIndex(null)
//     setIsOpen(false)
//   }

//   const handleSubmit = async (values: TData) => {
//     if (editingIndex !== null) {
//       setData((prev) =>
//         prev.map((item, index) => (index === editingIndex ? values : item)),
//       )
//     } else {
//       setData((prev) => [...prev, values])
//     }

//     resetModalState()
//   }

//   const handleCreate = () => {
//     setSelectedRecord({})
//     setEditingIndex(null)
//     setIsOpen(true)
//   }

//   const handleEdit = (record: TData, absoluteIndex: number) => {
//     setSelectedRecord(record)
//     setEditingIndex(absoluteIndex)
//     setIsOpen(true)
//   }

//   const handleDelete = (absoluteIndex: number) => {
//     const targetRecord = processedData[absoluteIndex]

//     setData((prev) => prev.filter((item) => item !== targetRecord))

//     const newTotalItems = totalItems - 1
//     const newTotalPages = Math.max(Math.ceil(newTotalItems / pageSize), 1)

//     if (currentPage > newTotalPages) {
//       setCurrentPage(newTotalPages)
//     }
//   }

//   const handleSortChange = (key: string) => {
//     setCurrentPage(1)

//     if (sortKey !== key) {
//       setSortKey(key)
//       setSortDirection("asc")
//       return
//     }

//     if (sortDirection === "asc") {
//       setSortDirection("desc")
//       return
//     }

//     setSortKey(null)
//     setSortDirection(null)
//   }

//   const handleFilterChange = (key: string, value: string) => {
//     setCurrentPage(1)

//     setColumnFilters((prev) => {
//       if (value === "all") {
//         const next = { ...prev }
//         delete next[key]
//         return next
//       }

//       return {
//         ...prev,
//         [key]: value,
//       }
//     })
//   }

//   return (
//     <PageWrapper
//       title={config.title}
//       description={
//         config.description ?? `Quản lý danh mục ${config.title.toLowerCase()}`
//       }
//     >
//       <div className="mt-4 flex flex-col gap-6">
//         <CrudToolbar entityName={config.title} onCreate={handleCreate} />

//         <CrudModal<TData>
//           open={isOpen}
//           onClose={resetModalState}
//           onSubmit={handleSubmit}
//           defaultValues={selectedRecord}
//           isEdit={editingIndex !== null}
//           Form={Form}
//           entityName={config.entityName}
//         />

//         <DataTable
//           columns={config.columns}
//           data={paginatedData}
//           paginationInfo={{ startItem, endItem, totalItems }}
//           pageSize={pageSize}
//           pageSizeOptions={pageSizeOptions}
//           onPageSizeChange={(size) => {
//             setPageSize(size)
//             setCurrentPage(1)
//           }}
//           sortKey={sortKey}
//           sortDirection={sortDirection}
//           filters={columnFilters}
//           onSortChange={handleSortChange}
//           onFilterChange={handleFilterChange}
//           actions={[
//             {
//               type: "edit",
//               label: "Edit",
//               onClick: (row) => {
//                 const absoluteIndex = processedData.findIndex(
//                   (item) => item === row,
//                 )

//                 handleEdit(row, absoluteIndex)
//               },
//             },
//             {
//               type: "delete",
//               label: "Delete",
//               onClick: (row) => {
//                 const absoluteIndex = processedData.findIndex(
//                   (item) => item === row,
//                 )

//                 handleDelete(absoluteIndex)
//               },
//             },
//           ]}
//         />

//         {config.table?.pagination && (
//           <div className="pt-2">
//             <TablePagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               pageSize={pageSize}
//               pageSizeOptions={pageSizeOptions}
//               totalItems={totalItems}
//               startItem={startItem}
//               endItem={endItem}
//               onPageChange={setCurrentPage}
//               onPageSizeChange={(size) => {
//                 setPageSize(size)
//                 setCurrentPage(1)
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </PageWrapper>
//   )
// }

"use client"

import { useMemo, useState } from "react"
import type { ComponentType } from "react"
import { Edit, Trash2 } from "lucide-react"

import type { CrudConfig } from "@/types/crud"

import PageWrapper from "@/components/common/PageWrapper"
import { DataTable, type TableAction } from "@/components/dashboard/table/DataTable"
import { TablePagination } from "@/components/dashboard/table/TablePagination"
import { CrudModal } from "./CrudModal"
import { CrudToolbar } from "./CrudToolbar"

export type CrudFormMode = "create" | "edit"

export type CrudFormProps<
  TData extends object,
  TSubmit extends object = TData,
> = {
  mode?: CrudFormMode
  defaultValues?: Partial<TData>
  onSubmit?: (values: TSubmit) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export type CrudSortDirection = "asc" | "desc"

export type UseCrudParams = {
  page: number
  size: number
  search: string
  sortKey: string | null
  sortDirection: CrudSortDirection | null
  filters: Record<string, string>
}

export type UseCrudResult<
  TData extends object,
  TSubmit extends object = TData,
> = {
  data: TData[]
  totalItems: number
  totalPages: number
  loading: boolean
  error: string | null

  refresh?: () => void | Promise<void>

  getRowKey?: (row: TData, index: number) => string | number

  createItem?: (values: TSubmit) => void | Promise<void>
  updateItem?: (record: TData, values: TSubmit) => void | Promise<void>
  deleteItem?: (record: TData) => void | Promise<void>

  customActions?: TableAction<TData>[]
}

export type UseCrudHook<
  TData extends object,
  TSubmit extends object = TData,
> = (params: UseCrudParams) => UseCrudResult<TData, TSubmit>

type CrudPageProps<
  TData extends object,
  TSubmit extends object = TData,
> = {
  config: CrudConfig<TData>
  Form: ComponentType<CrudFormProps<TData, TSubmit>>
  useCrud: UseCrudHook<TData, TSubmit>
}

export function CrudPage<
  TData extends object,
  TSubmit extends object = TData,
>({
  config,
  Form,
  useCrud,
}: CrudPageProps<TData, TSubmit>) {
  const pageSizeOptions = config.table?.pageSizeOptions ?? [10, 25, 50, 100]

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(config.table?.pageSize ?? 10)

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<CrudSortDirection | null>(
    null,
  )
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const [selectedRecord, setSelectedRecord] = useState<TData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data,
    totalItems,
    totalPages,
    loading,
    error,
    refresh,
    getRowKey,
    createItem,
    updateItem,
    deleteItem,
    customActions = [],
  } = useCrud({
    page: currentPage,
    size: pageSize,
    search,
    sortKey,
    sortDirection,
    filters: columnFilters,
  })

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const canCreate = Boolean(createItem)
  const canEdit = Boolean(updateItem)
  const canDelete = Boolean(deleteItem)

  const isEditMode = Boolean(selectedRecord)

  const handleOpenCreate = () => {
    if (!canCreate) return

    setSelectedRecord(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (record: TData) => {
    if (!canEdit) return

    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
    setIsModalOpen(false)
  }

  const handleSubmit = async (values: TSubmit) => {
    try {
      setIsSubmitting(true)

      if (selectedRecord && updateItem) {
        await updateItem(selectedRecord, values)
      } else if (!selectedRecord && createItem) {
        await createItem(values)
      }

      handleCloseModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (record: TData) => {
    if (!deleteItem) return

    const confirmed = window.confirm("Are you sure you want to delete this item?")

    if (!confirmed) return

    await deleteItem(record)
  }

  const handleSortChange = (key: string) => {
    setCurrentPage(1)

    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection("asc")
      return
    }

    if (sortDirection === "asc") {
      setSortDirection("desc")
      return
    }

    setSortKey(null)
    setSortDirection(null)
  }

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1)

    setColumnFilters((prev) => {
      if (value === "all") {
        const next = { ...prev }
        delete next[key]
        return next
      }

      return {
        ...prev,
        [key]: value,
      }
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const actions = useMemo<TableAction<TData>[]>(() => {
    const baseActions: TableAction<TData>[] = []

    if (canEdit) {
      baseActions.push({
        type: "edit",
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => handleOpenEdit(row),
      })
    }

    if (canDelete) {
      baseActions.push({
        type: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => handleDelete(row),
      })
    }

    return [...baseActions, ...customActions]
  }, [canEdit, canDelete, customActions])

  return (
    <PageWrapper
      title={config.title}
      description={
        config.description ?? `Quản lý danh mục ${config.title.toLowerCase()}`
      }
    >
      <div className="mt-4 flex flex-col gap-6">
        <CrudToolbar
          entityName={config.title}
          searchValue={search}
          onSearchChange={handleSearchChange}
          onCreate={handleOpenCreate}
          onRefresh={refresh}
          isRefreshing={loading}
          showCreate={canCreate}
        />

        <CrudModal<TData, TSubmit>
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          defaultValues={selectedRecord ?? undefined}
          isEdit={isEditMode}
          Form={Form}
          entityName={config.entityName}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={config.columns}
          data={data}
          paginationInfo={{ startItem, endItem, totalItems }}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          sortKey={sortKey}
          sortDirection={sortDirection}
          filters={columnFilters}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          getRowKey={getRowKey}
          actions={actions}
        />

        {config.table?.pagination && (
          <div className="pt-2">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}