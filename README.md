# Quy trình làm Dashboard cho một Entity

> **Entity** là tên folder và tên đối tượng. Tùy vào dashboard muốn quản lý đối tượng nào thì đặt tên entity tương ứng.  
> Ví dụ: `users`, `skills`, `jobs`, `products`.

---

## Tổng quan cấu trúc

Khi tạo dashboard cho một entity mới, cần tạo đầy đủ các phần sau:

```txt
neuro-bridge-fe/
├── services/
│   └── entity.service.ts
│
├── types/
│   └── entity.type.ts
│
├── schemas/
│   └── entity.schema.ts
│
├── modules/
│   ├── entity/
│   │   ├── entity.form.tsx
│   │   ├── entity.column.tsx
│   │   ├── entity.filter.tsx
│   │   ├── useEntityCrud.tsx
│   │   └── entity.config.ts
│   │
│   └── dashboard-register.ts
```

---

## Bước 1: Tạo API service trong folder `services`

Tạo file API dùng để gọi backend cho entity đó.

Ví dụ:

```txt
services/user.service.ts
services/skill.service.ts
services/product.service.ts
```

File này thường chứa các API như:

```ts
getList;
getById;
create;
update;
delete filter;
updateStatus;
...
```

Mục đích của bước này là tách phần gọi API riêng ra, giúp dashboard không gọi API trực tiếp trong component.

---

## Bước 2: Tạo `entity.type.ts` trong folder `types`

Tạo file type để định nghĩa kiểu dữ liệu cho entity.

Ví dụ:

```txt
types/user.type.ts
```

Trong file này cần khai báo các type chính như:

```ts
Entity;
EntityFilterRequest;
EntityListResult;
```

Ví dụ:

```ts
export type UserFilterRequest = {
  role?: string;
  status?: string;
  gender?: string;
  address?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type UserListResult = {
  data: User[];
  totalItems: number;
  totalPages: number;
};
```

Mục đích của bước này là giúp TypeScript biết dữ liệu đang dùng có cấu trúc như thế nào.

---

## Bước 3: Tạo `entity.schema.ts` trong folder `schemas`

Tạo schema để validate dữ liệu trong form.

Ví dụ:

```txt
schemas/user.schema.ts
```

Thường dùng `zod` để kiểm tra dữ liệu nhập vào:

```ts
import { z } from "zod";

export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
});

export type UserSchema = z.infer<typeof userSchema>;
```

Mục đích của bước này là kiểm tra dữ liệu trước khi gửi lên backend.

---

## Bước 4: Tạo các file trong `modules/entity/`

Trong folder `modules/entity/`, cần tạo các file xử lý riêng cho dashboard của entity đó.

Ví dụ với `users`:

```txt
modules/users/
├── user.form.tsx
├── user.column.tsx
├── user.filter.tsx
└── useUserCrud.tsx
```

### 4.1. `entity.form.tsx`

Dùng để định nghĩa form thêm mới hoặc chỉnh sửa entity.

Ví dụ:

```txt
user.form.tsx
```

Form này có thể dùng chung với `DataForm` hoặc custom riêng nếu cần.

---

### 4.2. `entity.column.tsx`

Dùng để định nghĩa các cột hiển thị trong bảng.

Ví dụ:

```txt
user.column.tsx
```

File này thường khai báo:

```ts
export const userColumns = [...]
```

Các cột thường có:

```txt
No.
Name
Email
Status
Role
Created At
Actions
```

---

### 4.3. `entity.filter.tsx`

Dùng để định nghĩa các filter cho bảng.

Ví dụ:

```txt
user.filter.tsx
```

Các filter thường gặp:

```txt
Search
Status
Role
Date range
Gender
Address
```

---

### 4.4. `useEntityCrud.tsx`

Dùng để gom toàn bộ logic CRUD của entity.

Ví dụ:

```txt
useUserCrud.tsx
```

File này thường xử lý:

```txt
get list
filter
create
update
delete
refresh data
custom action
```

Mục đích là để component dashboard không bị rối logic API.

---

## Bước 5: Tạo `entity.config.ts` trong `modules/entity`

File config dùng để gom tất cả cấu hình của entity.

Ví dụ:

```txt
modules/users/user.config.ts
```

File này thường chứa:

```ts
columns;
fields;
filters;
actions;
pagination;
search;
sort;
```

Ví dụ:

```ts
export const userConfig = {
  title: "Users",
  columns: userColumns,
  fields: userFields,
  filters: userFilters,
  searchPlaceholder: "Search users...",
};
```

Mục đích của bước này là giúp dashboard đọc cấu hình tự động thay vì code cứng từng trang.

---

## Bước 6: Đăng ký trong `dashboard-register.ts`

Sau khi tạo xong toàn bộ file của entity, cần đăng ký entity vào `dashboard-register.ts`.

Ví dụ:

```ts
export const dashboardRegister = {
  users: {
    config: userConfig,
    useCrud: useUserCrud,
  },
  skills: {
    config: skillConfig,
    useCrud: useSkillCrud,
  },
} as const;
```

Mục đích của bước này là để route dashboard biết entity nào đang được sử dụng.

Ví dụ khi vào đường dẫn:

```txt
/dashboard/users
```

Dashboard sẽ lấy cấu hình `users` trong `dashboardRegister`.

---

## Quy trình tóm tắt

```txt
Bước 1: Tạo API service trong services
Bước 2: Tạo type cho entity trong types
Bước 3: Tạo schema validate trong schemas
Bước 4: Tạo form, column, filter, useCrud trong modules/entity
Bước 5: Tạo config cho entity
Bước 6: Đăng ký entity trong dashboard-register.ts
```

---

## Checklist khi tạo dashboard mới

```txt
[ ] Đã tạo service API
[ ] Đã tạo entity.type.ts
[ ] Đã tạo EntityFilterRequest
[ ] Đã tạo EntityListResult
[ ] Đã tạo entity.schema.ts
[ ] Đã tạo entity.form.tsx
[ ] Đã tạo entity.column.tsx
[ ] Đã tạo entity.filter.tsx
[ ] Đã tạo useEntityCrud.tsx
[ ] Đã tạo entity.config.ts
[ ] Đã đăng ký trong dashboard-register.ts
[ ] Đã test route /dashboard/entity
```

---

## Ví dụ đặt tên theo entity

Nếu entity là `users`:

```txt
services/user.service.ts
types/user.type.ts
schemas/user.schema.ts
modules/users/user.form.tsx
modules/users/user.column.tsx
modules/users/user.filter.tsx
modules/users/useUserCrud.tsx
modules/users/user.config.ts
dashboard-register.ts
```

Nếu entity là `skills`:

```txt
services/skill.service.ts
types/skill.type.ts
schemas/skill.schema.ts
modules/skills/skill.form.tsx
modules/skills/skill.column.tsx
modules/skills/skill.filter.tsx
modules/skills/useSkillCrud.tsx
modules/skills/skill.config.ts
dashboard-register.ts
```

---

## Kết luận

Quy trình này giúp dashboard dễ mở rộng. Khi muốn thêm dashboard cho một entity mới, chỉ cần tạo đúng các file theo cấu trúc trên và đăng ký entity vào `dashboard-register.ts`.
