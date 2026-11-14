import { ContractListView } from "@/features/contract";

export const metadata = {
  title: "Contracts | NeuroBridge",
  description: "Quản lý hợp đồng chuyên gia",
};

export default function ExpertContractsPage() {
  return <ContractListView role="expert" />;
}
