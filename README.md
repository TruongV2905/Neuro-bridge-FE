# 🎛️ DASHBOARD UI MODULE DEVELOPMENT GUIDE

Frontend Dashboard UI được xây dựng theo kiến trúc CRUD có thể tái sử dụng và mở rộng.

Mỗi tính năng trong dashboard được phát triển như một module độc lập, sau đó được đăng ký vào hệ thống dashboard động. Cách tiếp cận này giúp dự án luôn nhất quán, dễ bảo trì và dễ mở rộng khi thêm các module nghiệp vụ mới.

Ví dụ về các dashboard module:

* Quản lý người dùng
* Quản lý dịch vụ AI
* Quản lý dự án

---

## 🛠️ PHẦN 1: Hướng dẫn dành cho Nhà phát triển chính

### Khi mở rộng hoặc thêm một Dashboard Module mới

Khi hệ thống phát triển và cần thêm một dashboard module mới, hãy tuân theo quy trình phát triển chuẩn hóa bên dưới.

Một dashboard module nên được đặt bên trong:

```txt
src/modules/<module-name>/
```

Ví dụ:

```txt
src/modules/users/
src/modules/available-ai/
src/modules/workspace/
```

Thư mục module chịu trách nhiệm quản lý cấu hình UI, cột bảng, form, hooks và logic cấp module.

Cấu trúc module được khuyến nghị:

```txt
src/modules/<module-name>/
├── types/
├── columns/
├── configs/
├── forms/
└── hooks/
```

API services và validation schemas được đặt bên ngoài thư mục module để giữ logic giao tiếp backend dùng chung và logic validation được quản lý tập trung.

Cấu trúc dùng chung được khuyến nghị:

```txt
src/services/
└── <module>.service.ts

src/schemas/
└── <module>.schema.ts
```

---

## ⚠️ Quy tắc phát triển quan trọng

Khi thêm hoặc cập nhật một dashboard module, developer chỉ nên làm việc bên trong thư mục module mục tiêu, file service liên quan, file schema liên quan và dashboard registry.

Không chỉnh sửa các file core dùng chung của dashboard, trừ khi cả team thống nhất rằng hành vi tổng thể của dashboard cần thay đổi.

Các file sau được xem là hạ tầng dashboard dùng chung:

```txt
src/types/crud.ts

src/components/dashboard/crud/CrudPage.tsx
src/components/dashboard/crud/CrudToolbar.tsx
src/components/dashboard/crud/CrudModal.tsx

src/components/dashboard/table/DataTable.tsx
src/components/dashboard/table/TablePagination.tsx

src/components/common/PageWrapper.tsx
```

Các file này được tái sử dụng bởi toàn bộ dashboard module.
Việc thay đổi chúng có thể ảnh hưởng đến mọi trang dashboard hiện có.

Tất cả UI elements phải sử dụng hệ thống component hiện có dựa trên shadcn từ:

```txt
src/components/ui
```

Developer nên tái sử dụng các UI component có sẵn như button, input, select, dialog, table, badge, dropdown menu, textarea, checkbox và card thay vì tạo các UI component trùng lặp.

---

# 📦 Quy trình chuẩn cho Dashboard Module

## Bước 1: Định nghĩa Module Types

Bước này được dùng để định nghĩa cấu trúc dữ liệu của module, bao gồm:

Type chính của entity
Giá trị enum
Type cho API request
Type cho API response
Các type tùy chọn phục vụ hiển thị

Mục đích của bước này là giúp module type-safe và tránh việc cấu trúc dữ liệu bị trùng lặp hoặc không rõ ràng giữa services, forms, columns, configs và hooks.

```txt
src/types/<module-name>/<module>.type.ts
```

---

## Bước 2: Tạo API Service Layer

Tạo file API service cho module.

Services được đặt bên ngoài src/modules vì chúng thuộc lớp giao tiếp API dùng chung.

```txt
src/services/<module>.service.ts
```

Service layer chịu trách nhiệm giao tiếp với backend API. File này nên chứa toàn bộ các hàm liên quan đến API như lấy dữ liệu, tạo bản ghi, cập nhật bản ghi, xóa bản ghi, khóa tài khoản, kích hoạt tài khoản hoặc thực hiện các hành động riêng của module.

Service layer giúp tách biệt logic API khỏi UI components.

Không gọi API trực tiếp bên trong:

```txt
Page components
Table components
Form components
Modal components
```

Toàn bộ giao tiếp backend nên đi qua service layer.

---

## Bước 3: Tạo Validation Schema

Tạo validation schema cho form của module.

Schemas được đặt bên ngoài src/modules vì các quy tắc validation có thể được tái sử dụng bởi nhiều component, page hoặc workflow khác nhau.

```txt
src/schemas/<module>.schema.ts
```

Schema được dùng để validate dữ liệu create và update trước khi submit lên backend.

Schema nên định nghĩa:

* Các field bắt buộc
* Các field tùy chọn
* Quy tắc độ dài field
* Validation enum
* Validation email hoặc URL
* Bất kỳ ràng buộc input nghiệp vụ nào mà module yêu cầu

Mục đích của bước này là giữ form validation được quản lý tập trung và ngăn payload không hợp lệ được submit lên API.

---

## Bước 4: Định nghĩa Table Columns

Tạo file định nghĩa cột bảng cho module.

File này mô tả cách dữ liệu của module được hiển thị bên trong dashboard table có thể tái sử dụng.

```txt
src/modules/<module-name>/columns/<module>.columns.tsx
```

Column definitions có thể bao gồm:

* Nhãn cột
* Field hiển thị
* Cột có thể search
* Cột có thể sort
* Cột có thể filter
* Render cell tùy chỉnh
* Định dạng hiển thị status hoặc role

File columns chỉ nên kiểm soát hành vi hiển thị của bảng.
Business logic nên nằm trong services, hooks hoặc utilities riêng của module.

---

## Bước 5: Tạo Module Config

Tạo file cấu hình module.

File config kết nối metadata của module với hệ thống dashboard có thể tái sử dụng.

```txt
src/modules/<module-name>/configs/<module>.config.ts
```

Module config thường định nghĩa:

* Tên entity
* Tiêu đề trang
* Mô tả trang
* Table columns
* Cấu hình search
* Tùy chọn pagination
* Tùy chọn filter
* Hành vi mặc định của bảng
* Cấu hình dashboard cấp module

Mục đích của bước này là cho phép CrudPage dùng chung render module một cách chính xác mà không cần thay đổi core dashboard components.

---

## Bước 6: Tạo Form Component

Tạo form component cho hành động create và update.

```txt
src/modules/<module-name>/forms/<Module>Form.tsx
```

Form component nên:

* Sử dụng shadcn UI components
* Hỗ trợ create mode
* Hỗ trợ edit mode
* Nhận default values khi chỉnh sửa
* Sử dụng schema dùng chung từ src/schemas
* Submit dữ liệu thông qua submit handler được truyền vào
* Hiển thị lỗi validation rõ ràng

Form chỉ nên tập trung vào việc render và validate input của người dùng.

Không đặt business logic không liên quan hoặc gọi API trực tiếp bên trong form, trừ khi module có lý do cụ thể để làm vậy.

---

## Bước 7: Tạo CRUD Hook

Tạo custom hook để quản lý CRUD workflow của module.

```txt
src/modules/<module-name>/hooks/use<Module>Crud.ts
```

CRUD hook nên xử lý:

* Fetching data
* Creating records
* Updating records
* Deleting or disabling records
* Managing loading state
* Managing error state
* Calling service functions from `src/services`
* Exposing handlers to the dashboard page

Bước này giúp business logic nằm ngoài UI components và làm module dễ bảo trì, dễ debug và dễ tái sử dụng hơn.

---

## Bước 8: Đăng ký Module vào Dashboard

Sau khi hoàn thành module, đăng ký module đó trong dashboard registry.

```txt
src/modules/dashboard-register.ts
```

Registry kết nối module config và form component với hệ thống dashboard có thể tái sử dụng.

Sau khi đăng ký, module có thể được truy cập thông qua dynamic dashboard route.

Route ví dụ:

```txt
/dashboard/<module-name>
```

For example:

```txt
/dashboard/users
/dashboard/available-ai
/dashboard/workspace
```

Mục đích của bước này là đưa module vào dashboard mà không cần tạo thủ công một page riêng cho từng module.

---

# 🧩 PHẦN 2: QUY TẮC CHUNG

## When Working With Existing Dashboard Modules

When working on an existing module, developers should follow the module-based structure and avoid changing shared dashboard infrastructure.

For example, when working on the `users` module, changes are usually located in:

```txt
src/modules/users/
src/services/user.service.ts
src/schemas/user.schema.ts
```

Typical files inside a module include:

```txt
types/
columns/
configs/
forms/
hooks/
```

---

## 1. Không chỉnh sửa Core Dashboard Components

Tránh chỉnh sửa các file dashboard dùng chung, trừ khi có yêu cầu đã được xác nhận để thay đổi hành vi tổng thể của dashboard.

Các file dùng chung ảnh hưởng đến tất cả dashboard module, vì vậy việc thay đổi chúng có thể dễ dàng làm hỏng các trang khác.

---

## 2. Làm việc bên trong Module mục tiêu và các file dùng chung liên quan

Mỗi module nên được tách biệt và chịu trách nhiệm cho hành vi dashboard riêng của nó.

For example:

```txt
src/modules/users/
src/modules/available-ai/
src/modules/workspace/
```

API services nên được đặt trong:

```txt
src/services/
```

Validation schemas nên được đặt trong:

```txt
src/schemas/
```

This keeps the project organized while still allowing services and schemas to be reused outside the dashboard when needed.

---

## 3. Giữ Business Logic trong Hooks

CRUD workflow và business logic riêng của module nên được đặt bên trong module hook.

Example:

```txt
src/modules/<module-name>/hooks/use<Module>Crud.ts
```

# ✅ Checklist cuối cùng trước khi đăng ký Module

Trước khi đăng ký một dashboard module mới, hãy đảm bảo các mục sau đã hoàn thành:

```txt
[ ] Module types are defined.
[ ] API service layer is created in src/services.
[ ] Validation schema is created in src/schemas.
[ ] Table columns are configured.
[ ] Module config is completed.
[ ] Form component supports create and edit modes.
[ ] CRUD hook handles module workflow.
[ ] shadcn UI components are used.
[ ] No shared dashboard core file is modified.
[ ] Module is registered in dashboard-register.ts.
[ ] Dynamic dashboard route works correctly.
```

---

# 🚀 Tóm tắt 

Để thêm một Dashboard UI module mới, luôn tuân theo workflow sau:

```txt
Step 1: types
Step 2: services/api
Step 3: schemas
Step 4: columns
Step 5: configs
Step 6: forms
Step 7: hooks/useXxxCrud
Step 8: register into dashboard
```

Vị trí file:

```txt
src/modules/<module-name>/types/
src/services/<module>.service.ts
src/schemas/<module>.schema.ts
src/modules/<module-name>/columns/
src/modules/<module-name>/configs/
src/modules/<module-name>/forms/
src/modules/<module-name>/hooks/
src/modules/dashboard-register.ts
```
