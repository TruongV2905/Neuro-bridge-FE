"use client";

import { useMemo, useState } from "react";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Eye, Trash2 } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import type { CrudConfig, UseCrudHook } from "@/types/dasboard";

import PageWrapper from "@/components/common/PageWrapper";
import {
  DataTable,
  type TableAction,
} from "@/components/dashboard/table/DataTable";
import { TablePagination } from "@/components/dashboard/table/TablePagination";

import { CrudModal } from "./CrudModal";
import { CrudToolbar } from "./CrudToolbar";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { CrudViewModal } from "./CrudViewModal";

export type ApiSortDirection = "ASCENDING" | "DESCENDING";

type FilterKey<TFilter extends object> = Extract<keyof TFilter, string>;

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

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<TData | null>(null);

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
    importItems,
    createItem,
    updateItem,
    deleteItem,
    handlers = {},
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

  const canCreate = Boolean(config.actions?.create && createItem);
  const canEdit = Boolean(config.actions?.edit && updateItem);
  const canDelete = Boolean(config.actions?.delete && deleteItem);
  const canView = Boolean(config.actions?.view && config.view);

  const isEditMode = isModalOpen && Boolean(selectedRecord);
  const tableData = config.useMockData ? (config.mockData ?? []) : data;

  const tableTotalItems = config.useMockData ? tableData.length : totalItems;
  const tableTotalPages = config.useMockData
    ? Math.max(1, Math.ceil(tableData.length / pageSize))
    : totalPages;
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

  const handleOpenView = (record: TData) => {
    if (!canView) return;

    setViewRecord(record);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setViewRecord(null);
    setIsViewOpen(false);
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

  const handleSortChange = (
    key?: string,
    direction?: "ASCENDING" | "DESCENDING",
  ) => {
    setCurrentPage(1);
    setSortBy(key);
    setSortDirection(direction);
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

  const moduleCustomActions = useMemo<TableAction<TData>[]>(() => {
    return (config.customActions ?? []).map((action) => {
      if (!action.actionKey) {
        return action;
      }

      return {
        ...action,
        onClick: async (row, rowIndex) => {
          const handler = handlers[action.actionKey!];

          await handler?.(row);
          await action.onClick?.(row, rowIndex);
        },
      };
    });
  }, [config.customActions, handlers]);

  const actions = useMemo<TableAction<TData>[]>(() => {
    const baseActions: TableAction<TData>[] = [];

    if (canView) {
      baseActions.push({
        type: "view",
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        hidden: (row) => config.actions?.canView?.(row) === false,
        onClick: (row) => handleOpenView(row),
      });
    }

    if (canEdit) {
      baseActions.push({
        type: "edit",
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        hidden: (row) => config.actions?.canEdit?.(row) === false,
        onClick: (row) => handleOpenEdit(row),
      });
    }

    if (canDelete) {
      baseActions.push({
        type: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        variant: "destructive",
        hidden: (row) => config.actions?.canDelete?.(row) === false,
        onClick: (row) => handleDelete(row),
      });
    }

    return [...baseActions, ...moduleCustomActions];
  }, [canView, canEdit, canDelete, moduleCustomActions, config.actions]);

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
          onImport={importItems}
          isRefreshing={loading}
          isImporting={loading}
          showCreate={canCreate}
        />

        <CrudModal<TSubmit>
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          mode={isEditMode ? "edit" : "create"}
          form={form}
          fields={config.fields ?? []}
          entityName={config.entityName}
          isSubmitting={isSubmitting}
        />

        <CrudViewModal<TData>
          open={isViewOpen}
          onClose={handleCloseView}
          record={viewRecord}
          title={config.view?.title ?? `${config.entityName} Detail`}
          render={config.view?.render}
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
          data={tableData}
          actions={actions}
          paginationInfo={{ startItem, endItem, totalItems: tableTotalItems }}
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
              totalPages={tableTotalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
