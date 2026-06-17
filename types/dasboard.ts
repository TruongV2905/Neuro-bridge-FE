import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

import type { PageRequest } from "./common.starter";
import type { TableAction } from "@/components/dashboard/table/DataTable";

/**
 * Params dùng chung cho các hook CRUD.
 * Dùng để truyền pagination, search, sort, filter từ CrudPage xuống useCrud.
 */
export type UseCrudParams<TFilter extends object = Record<string, unknown>> =
  PageRequest & {
    filters?: Partial<TFilter>;
  };

/**
 * Handler cho custom action.
 *
 * Ví dụ:
 * - activateUser(record)
 * - banUser(record)
 * - toggleSkillStatus(record)
 *
 * record chính là row data được truyền từ DataTable.
 */
export type CrudActionHandler<TData extends object> = (
  record: TData,
) => void | Promise<void>;

/**
 * Kết quả mà mỗi useCrud hook cần trả về cho CrudPage.
 *
 * useCrud chỉ nên xử lý data/API:
 * - lấy danh sách
 * - loading/error
 * - create/update/delete/import/export
 * - handlers cho custom actions
 *
 * Không nên để UI như icon, label, className trong đây.
 */
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
  importItems?: (file: File) => void | Promise<void>;

  createItem?: (values: TSubmit) => void | Promise<void>;
  updateItem?: (record: TData, values: TSubmit) => void | Promise<void>;
  deleteItem?: (record: TData) => void | Promise<void>;

  /**
   * Object chứa các function xử lý custom action.
   *
   * Ví dụ trong useUserCrud:
   * handlers: {
   *   activateUser: async (user) => {},
   *   banUser: async (user) => {},
   * }
   *
   * Sau đó trong config.customActions sẽ dùng:
   * actionKey: "activateUser"
   */
  handlers?: Record<string, CrudActionHandler<TData>>;
};

/**
 * Type cho custom hook CRUD của từng module.
 *
 * Ví dụ:
 * useUserCrud: UseCrudHook<User, UserSchema, UserFilter>
 * useSkillCrud: UseCrudHook<SkillResponse, SkillSchema>
 */
export type UseCrudHook<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> = (params: UseCrudParams<TFilter>) => UseCrudResult<TData, TSubmit>;

/**
 * Các loại field mà DataForm hỗ trợ.
 */
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "upload"
  | "email"
  | "password"
  | "date"
  | "checkbox"
  | "switch"
  | "radio"
  | "multiSelect"
  | "custom";

export type FieldOption = {
  label: string;
  value: string | number | boolean;
};

/**
 * Config cho từng field trong form Create/Edit.
 *
 * TFormValues là schema form.
 * TName là tên field, được ép theo key hợp lệ của TFormValues.
 */
export interface FieldConfig<
  TFormValues extends FieldValues = FieldValues,
  TName extends Path<TFormValues> = Path<TFormValues>,
> {
  name: TName;
  label: string;
  type: FieldType;

  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FieldOption[];

  /**
   * Dùng để field chiếm 1 hoặc 2 cột trong form layout.
   */
  span?: 1 | 2;

  /**
   * Dùng cho field custom.
   * Ví dụ: custom MultiSelect, Upload, RichTextEditor...
   */
  render?: (props: {
    field: ControllerRenderProps<TFormValues, TName>;
    fieldState: ControllerFieldState;
    form: UseFormReturn<TFormValues>;
    config: FieldConfig<TFormValues, TName>;
    isSubmitting: boolean;
  }) => ReactNode;
}

/**
 * Các loại filter mà CrudToolbar hỗ trợ.
 */
export type FilterType =
  | "text"
  | "select"
  | "multi-select"
  | "number"
  | "number-range"
  | "date"
  | "date-range"
  | "boolean";

export type FilterOption = {
  label: string;
  value: string | number | boolean;
};

export type FilterKey<TFilter extends object> = Extract<keyof TFilter, string>;

/**
 * Config cho filter trong toolbar.
 *
 * TFilter là object filter request.
 * Ví dụ:
 * type UserFilter = {
 *   role?: string;
 *   status?: string;
 *   createdFrom?: string;
 *   createdTo?: string;
 * }
 */
export type FilterConfig<TFilter extends object = Record<string, unknown>> = {
  name: FilterKey<TFilter>;
  label: string;
  type: FilterType;

  placeholder?: string;
  options?: FilterOption[];

  min?: number;
  max?: number;
  step?: number;
  defaultValue?: unknown;

  /**
   * Dùng cho filter dạng range.
   *
   * Ví dụ:
   * rangeKeys: {
   *   from: "budgetFrom",
   *   to: "budgetTo",
   * }
   */
  rangeKeys?: {
    from: FilterKey<TFilter>;
    to: FilterKey<TFilter>;
  };
};

/**
 * Config cho table.
 */
export interface TableConfig {
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  searchable?: boolean;
}

/**
 * Config bật/tắt action chung của CrudPage.
 *
 * view/create/edit/delete là bật tắt theo module.
 * canView/canEdit/canDelete là điều kiện theo từng row.
 */
export type CrudActionConfig<TData extends object> = {
  /**
   * Bật nút View cho toàn bộ module.
   */
  view?: boolean;

  /**
   * Bật nút Create trên toolbar.
   */
  create?: boolean;

  /**
   * Bật nút Edit trong action row.
   */
  edit?: boolean;

  /**
   * Bật nút Delete trong action row.
   */
  delete?: boolean;

  /**
   * Điều kiện hiển thị nút View theo từng row.
   *
   * Ví dụ:
   * canView: (user) => user.status !== "BANNED"
   */
  canView?: (record: TData) => boolean;

  /**
   * Điều kiện hiển thị nút Edit theo từng row.
   *
   * Ví dụ:
   * canEdit: (skill) => !skill.deleted
   */
  canEdit?: (record: TData) => boolean;

  /**
   * Điều kiện hiển thị nút Delete theo từng row.
   *
   * Ví dụ:
   * canDelete: (user) => user.role !== "ADMIN"
   */
  canDelete?: (record: TData) => boolean;
};

/**
 * Config cho modal View/Detail.
 *
 * render nhận vào record của row đang bấm View.
 */
export type CrudViewConfig<TData extends object> = {
  /**
   * Title của modal View.
   *
   * Nếu không truyền, CrudPage có thể tự dùng:
   * `${entityName} Detail`
   */
  title?: string;

  /**
   * UI detail riêng cho từng module.
   *
   * Ví dụ:
   * render: (user) => <UserDetail user={user} />
   */
  render?: (record: TData) => ReactNode;
};

/**
 * Config tổng cho một module CRUD.
 *
 * Mỗi module như users, skills, jobPosts sẽ có một config riêng.
 *
 * Quy ước:
 * - config lo UI
 * - useCrud lo API/data
 * - CrudPage đứng giữa nối hai bên lại
 */
export interface CrudConfig<
  TData extends object = object,
  TFormValues extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> {
  /**
   * Tên entity dạng số ít.
   *
   * Ví dụ:
   * "user", "skill", "job post"
   */
  entityName: string;

  /**
   * Tiêu đề page.
   *
   * Ví dụ:
   * "User Management"
   */
  title: string;

  /**
   * Mô tả page.
   */
  description?: string;

  /**
   * Zod schema cho form Create/Edit.
   */
  schema?: ZodType<TFormValues>;

  /**
   * Danh sách field dùng cho CrudModal Create/Edit.
   */
  fields?: FieldConfig<TFormValues>[];

  /**
   * Column của TanStack Table.
   */
  columns: ColumnDef<TData>[];

  /**
   * Filter hiển thị trên CrudToolbar.
   */
  filters?: FilterConfig<TFilter>[];

  /**
   * Config table: pagination, pageSize, searchable...
   */
    table?: TableConfig;

  /**
   * Bật/tắt action chung như view/create/edit/delete.
   */
  actions?: CrudActionConfig<TData>;

  /**
   * Config View modal.
   */
  view?: CrudViewConfig<TData>;

  /**
   * Các action đặc biệt của module.
   *
   * Ví dụ:
   * User: Activate, Inactive, Ban
   * Skill: Activate, Inactive
   * Proposal: Approve, Reject
   *
   * Lưu ý:
   * Nếu action cần gọi API, khai báo actionKey trùng với key trong useCrud.handlers.
   */
  customActions?: TableAction<TData>[];

  /**
   * Data tĩnh.
   *
   * Có thể giữ nếu cần dùng module không gọi API.
   * Nếu chỉ dùng mock, nên ưu tiên mockData + useMockData.
   */
  data?: TData[];

  /**
   * Mock data dùng để test UI khi API chưa xong.
   */
  mockData?: TData[];

  /**
   * Bật true để CrudPage dùng mockData thay vì data từ API.
   */
  useMockData?: boolean;
}
