"use client"

import { useMemo, useState } from "react"
import type { ComponentType } from "react"

import type { CrudConfig } from "@/types/crud"

import PageWrapper from "@/components/common/PageWrapper"
import { DataTable } from "@/components/dashboard/table/DataTable"
import { TablePagination } from "@/components/dashboard/table/TablePagination"
import { CrudModal } from "./CrudModal"
import { CrudToolbar } from "./CrudToolbar"

export type CrudFormMode = "create" | "edit"

export type CrudFormProps<TData extends object> = {
  mode?: CrudFormMode
  defaultValues?: Partial<TData>
  onSubmit?: (values: TData) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

type CrudPageProps<TData extends object> = {
  config: CrudConfig<TData>
  Form: ComponentType<CrudFormProps<TData>>
}

export function CrudPage<TData extends object>({
  config,
  Form,
}: CrudPageProps<TData>) {
  const [data, setData] = useState<TData[]>(config.data ?? [])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Partial<TData>>({})
  const [isOpen, setIsOpen] = useState(false)

  const pageSizeOptions = config.table?.pageSizeOptions ?? [10, 25, 50, 100]

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(config.table?.pageSize ?? 10)

  const totalItems = data.length
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1)

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  const startItem = totalItems === 0 ? 0 : startIndex + 1
  const endItem = Math.min(endIndex, totalItems)

  const resetModalState = () => {
    setSelectedRecord({})
    setEditingIndex(null)
    setIsOpen(false)
  }

  const handleSubmit = async (values: TData) => {
    if (editingIndex !== null) {
      setData((prev) =>
        prev.map((item, index) => (index === editingIndex ? values : item)),
      )
    } else {
      setData((prev) => [...prev, values])
    }

    resetModalState()
  }

  const handleCreate = () => {
    setSelectedRecord({})
    setEditingIndex(null)
    setIsOpen(true)
  }

  const handleEdit = (record: TData, absoluteIndex: number) => {
    setSelectedRecord(record)
    setEditingIndex(absoluteIndex)
    setIsOpen(true)
  }

  const handleDelete = (absoluteIndex: number) => {
    setData((prev) => prev.filter((_, index) => index !== absoluteIndex))

    const newTotalItems = totalItems - 1
    const newTotalPages = Math.max(Math.ceil(newTotalItems / pageSize), 1)

    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
  }

  return (
    <PageWrapper
      title={config.title}
      description={
        config.description ?? `Quản lý danh mục ${config.title.toLowerCase()}`
      }
    >
      <div className="mt-4 flex flex-col gap-6">
        <CrudToolbar entityName={config.title} onCreate={handleCreate} />

        <CrudModal<TData>
          open={isOpen}
          onClose={resetModalState}
          onSubmit={handleSubmit}
          defaultValues={selectedRecord}
          isEdit={editingIndex !== null}
          Form={Form}
          entityName={config.entityName}
        />

        <DataTable
          columns={config.columns}
          data={paginatedData}
          paginationInfo={{ startItem, endItem, totalItems }}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          actions={[
            {
              type: "edit",
              label: "Edit",
              onClick: (row, rowIndex) => {
                handleEdit(row, startIndex + rowIndex)
              },
            },
            {
              type: "delete",
              label: "Delete",
              onClick: (_, rowIndex) => {
                handleDelete(startIndex + rowIndex)
              },
            },
          ]}
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