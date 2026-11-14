import { ContractListView } from "@/features/contract";

export const metadata = {
  title: "Contracts | NeuroBridge",
  description: "Quản lý hợp đồng bên thuê",
};

export default function ClientContractsPage() {
  return <ContractListView role="client" />;
}
