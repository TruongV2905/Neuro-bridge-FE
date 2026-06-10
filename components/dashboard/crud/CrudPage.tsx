"use client";

import { useMemo, useState } from "react";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2 } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import type { CrudConfig } from "@/types/dasboard";
import type {
  PageRequest,
} from "@/types/common.starter";

import PageWrapper from "@/components/common/PageWrapper";
import {
  DataTable,
  type TableAction,
} from "@/components/dashboard/table/DataTable";
import { TablePagination } from "@/components/dashboard/table/TablePagination";

import { CrudModal } from "./CrudModal";
import { CrudToolbar } from "./CrudToolbar";
import { ConfirmActionDialog } from "./ConfirmActionDialog";

export type ApiSortDirection = "ASCENDING" | "DESCENDING";

export type UseCrudParams<TFilter extends object = Record<string, unknown>> =
  PageRequest & {
    filters?: Partial<TFilter>;
  };
type FilterKey<TFilter extends object> = Extract<keyof TFilter, string>;
export type UseCrudResult<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
> = {
  data: TData[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refresh?: () => void | Promise<void>;
  exportItems?: () => void | Promise<void>;
  createItem?: (values: TSubmit) => void | Promise<void>;
  updateItem?: (record: TData, values: TSubmit) => void | Promise<void>;
  deleteItem?: (record: TData) => void | Promise<void>;

  customActions?: TableAction<TData>[];
};

export type UseCrudHook<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> = (params: UseCrudParams<TFilter>) => UseCrudResult<TData, TSubmit>;

type CrudPageProps<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> = {
  config: CrudConfig<TData, TSubmit, TFilter>;
  useCrud: UseCrudHook<TData, TSubmit, TFilter>;
  createDefaultValues?: Partial<TSubmit>;
  mapRecordToFormValues?: (record: TData) => Partial<TSubmit>;
};

export function CrudPage<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
>({
  config,
  useCrud,
  createDefaultValues,
  mapRecordToFormValues,
}: CrudPageProps<TData, TSubmit, TFilter>) {
  const pageSizeOptions = config.table?.pageSizeOptions ?? [10, 25, 50, 100];

  const form = useForm<TSubmit>({
    resolver: config.schema
      ? (zodResolver(config.schema as never) as Resolver<TSubmit>)
      : undefined,
    defaultValues: (createDefaultValues ?? {}) as DefaultValues<TSubmit>,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.table?.pageSize ?? 10);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<
    ApiSortDirection | undefined
  >(undefined);

  const [filters, setFilters] = useState<Partial<TFilter>>({});

  const [selectedRecord, setSelectedRecord] = useState<TData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    totalItems,
    totalPages,
    loading,
    error,
    refresh,
    exportItems,
    createItem,
    updateItem,
    deleteItem,
    customActions = [],
  } = useCrud({
    page: currentPage - 1,
    size: pageSize,
    search: debouncedSearch,
    sortBy,
    sortDirection,
    filters,
  });
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canCreate = Boolean(createItem);
  const canEdit = Boolean(updateItem);
  const canDelete = Boolean(deleteItem);

  const isEditMode = isModalOpen && Boolean(selectedRecord);

  const handleOpenCreate = () => {
    if (!canCreate) return;

    setSelectedRecord(null);
    form.reset((createDefaultValues ?? {}) as DefaultValues<TSubmit>);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: TData) => {
    if (!canEdit) return;

    setSelectedRecord(record);

    const values = mapRecordToFormValues
      ? mapRecordToFormValues(record)
      : (record as unknown as Partial<TSubmit>);

    form.reset(values as DefaultValues<TSubmit>);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
    form.reset((createDefaultValues ?? {}) as DefaultValues<TSubmit>);
  };

  const handleSubmit = async (values: TSubmit) => {
    try {
      setIsSubmitting(true);

      if (selectedRecord && updateItem) {
        await updateItem(selectedRecord, values);
      } else if (!selectedRecord && createItem) {
        await createItem(values);
      }

      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: TData) => {
    if (!deleteItem) return;

    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || !selectedRecord) return;

    try {
      setIsDeleting(true);

      await deleteItem(selectedRecord);

      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortChange = (key: string) => {
    setCurrentPage(1);

    if (sortBy !== key) {
      setSortBy(key);
      setSortDirection("ASCENDING");
      return;
    }

    if (sortDirection === "ASCENDING") {
      setSortDirection("DESCENDING");
      return;
    }

    setSortBy(undefined);
    setSortDirection(undefined);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name: FilterKey<TFilter>, value: unknown) => {
    setCurrentPage(1);

    setFilters((prev) => {
      const next = { ...prev } as Partial<Record<FilterKey<TFilter>, unknown>>;

      const shouldRemove =
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all" ||
        (Array.isArray(value) && value.length === 0);

      if (shouldRemove) {
        delete next[name];
        return next as Partial<TFilter>;
      }

      next[name] = value;

      return next as Partial<TFilter>;
    });
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilters({});
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const actions = useMemo<TableAction<TData>[]>(() => {
    const baseActions: TableAction<TData>[] = [];

    if (canEdit) {
      baseActions.push({
        type: "edit",
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => handleOpenEdit(row),
      });
    }

    if (canDelete) {
      baseActions.push({
        type: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        variant: "destructive",
        onClick: (row) => handleDelete(row),
      });
    }

    return [...baseActions, ...customActions];
  }, [canEdit, canDelete, customActions]);

  return (
    <PageWrapper
      title={config.title}
      description={
        config.description ?? `Quản lý danh mục ${config.title.toLowerCase()}`
      }
    >
      <div className="mt-4 flex flex-col gap-6">
        <CrudToolbar<TFilter>
          entityName={config.title}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          filters={config.filters}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onCreate={handleOpenCreate}
          onRefresh={refresh}
          onExport={exportItems}
          isRefreshing={loading}
          showCreate={canCreate}
        />

        <CrudModal<TSubmit>
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isEdit={isEditMode}
          form={form}
          fields={config.fields ?? []}
          entityName={config.entityName}
          isSubmitting={isSubmitting}
        />

        <ConfirmActionDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);

            if (!open) {
              setSelectedRecord(null);
            }
          }}
          title="Delete item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={config.columns}
          data={data}
          actions={actions}
          paginationInfo={{ startItem, endItem, totalItems }}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={handlePageSizeChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
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
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
