import { crudConfigs } from "@/configs"
import { CrudPage } from "@/components/crud/CrudPage"
import type { CrudConfig } from "@/types/crud"

export default async function DynamicCrudPage({
  params,
}: {
  params: Promise<{ entities: string }>;
}) {
  const resolvedParams = await params;
  const entityName = resolvedParams.entities;

  if (!entityName || !(entityName in crudConfigs)) {
    return (
      <div className="p-4">
        <h2 className="text-red-500 font-bold">Lỗi Module:</h2>
        <p>URL đang tìm: <b>{entityName}</b></p>
        <p>Các module đang có trong config: <b>{Object.keys(crudConfigs).join(", ")}</b></p>
      </div>
    );
  }

  const config = crudConfigs[entityName as keyof typeof crudConfigs] as CrudConfig<object>;

  return (
    <CrudPage
      key={entityName}
      config={config}
    />
  )
}