// import { crudConfigs } from "@/configs"
// import { CrudPage } from "@/components/crud/CrudPage"
// import type { CrudConfig } from "@/types/crud"

// export default async function DynamicCrudPage({
//   params,
// }: {
//   params: Promise<{ entities: string }>; 
// }) {
//   const resolvedParams = await params;
//   const entityName = resolvedParams.entities; 

//   if (!entityName || !(entityName in crudConfigs)) {
//     return (
//       <div className="p-4">
//         <h2 className="text-red-500 font-bold">Lỗi Module:</h2>
//         <p>URL đang tìm: <b>{entityName}</b></p>
//         <p>Các module đang có trong config: <b>{Object.keys(crudConfigs).join(", ")}</b></p>
//       </div>
//     );
//   }

//   const config = crudConfigs[entityName as keyof typeof crudConfigs] as CrudConfig<object>;

//   return (
//     <CrudPage
//       key={entityName}
//       config={config}
//     />
//   )
// }

import { crudConfigs } from "@/configs"
import { CrudPage } from "@/components/crud/CrudPage"
import type { CrudConfig } from "@/types/crud"
import { AlertTriangle } from "lucide-react"

export default async function DynamicCrudPage({
  params,
}: {
  params: Promise<{ entities: string }>; 
}) {
  const resolvedParams = await params;
  const entityName = resolvedParams.entities; 

  const config = crudConfigs[entityName as keyof typeof crudConfigs] as CrudConfig<object> | undefined;

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Module không tồn tại</h2>
        <p className="text-muted-foreground max-w-md">
          Hệ thống không tìm thấy đường dẫn: <b className="text-foreground">{entityName}</b>. <br/>
          Vui lòng kiểm tra lại cấu hình hoặc chọn module khác từ thanh điều hướng.
        </p>
      </div>
    );
  }

  return <CrudPage key={entityName} config={config} />;
}