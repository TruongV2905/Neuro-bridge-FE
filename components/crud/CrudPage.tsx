"use client";

import type { CrudConfig } from "@/types/crud"
import { DataTable } from "@/components/table/DataTable"
import { useState } from "react"
import { CrudModal } from "./CrudModal"
import { CrudToolbar } from "./CrudToolbar"
import { TablePagination } from "../table/TablePagination"
// Import PageWrapper mới
import PageWrapper from "@/components/common/PageWrapper"

export function CrudPage<T extends object>({
  config,
}: {
  config: CrudConfig<T>
}) {
  const [data, setData] = useState<T[]>(config.data || [])
  const [formData, setFormData] = useState<Partial<T>>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Pagination state
  const pageSizeOptions =
    config.table?.pageSizeOptions || [10, 25, 50, 100]

  const [currentPage, setCurrentPage] = useState(1)

  const [pageSize, setPageSize] = useState(
    config.table?.pageSize || 10
  )

  // CREATE / UPDATE
  const handleSubmit = () => {
    if (editingIndex !== null) {
      const newData = [...data]
      newData[editingIndex] = formData as T
      setData(newData)
    } else {
      setData((prev) => [...prev, formData as T])
    }

    setFormData({})
    setEditingIndex(null)
    setIsOpen(false)
  }

  const handleCreate = () => {
    setFormData({})
    setEditingIndex(null)
    setIsOpen(true)
  }

  // EDIT
  const handleEdit = (record: T, index: number) => {
    setFormData(record)
    setEditingIndex(index)
    setIsOpen(true)
  }

  // DELETE
  const handleDelete = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index))
  }

  // PAGINATION
  const totalItems = data.length

  const totalPages = Math.ceil(totalItems / pageSize)

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedData = data.slice(startIndex, endIndex)

  const startItem = totalItems === 0 ? 0 : startIndex + 1
  const endItem = Math.min(endIndex, totalItems)

  return (
    // Sử dụng PageWrapper bao bọc toàn bộ nội dung
    <PageWrapper 
      title={config.title} 
      description={`Quản lý danh mục ${config.title.toLowerCase()}`}
    >
      <div className="space-y-6">
        <CrudToolbar
          // Đã bỏ title ở đây vì PageWrapper đã lo phần hiển thị tiêu đề
          onCreate={handleCreate}
        />
        
        <CrudModal<T>
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          fields={config.fields}
          formData={formData}
          setFormData={setFormData}
          isEdit={editingIndex !== null}
        />

        <DataTable
          columns={config.columns}
          data={paginatedData}
          // Pagination info for toolbar
          paginationInfo={{
            startItem,
            endItem,
            totalItems,
          }}
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
              onClick: (row) => {
                const index = data.indexOf(row)
                handleEdit(row, index)
              },
            },
            {
              type: "delete",
              label: "Delete",
              onClick: (row) => {
                const index = data.indexOf(row)
                handleDelete(index)
              },
            },
          ]}
        />
        
        {config.table?.pagination && (
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
        )}
      </div>
    </PageWrapper>
  )
}