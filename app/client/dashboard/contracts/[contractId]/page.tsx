import { ContractSigningView } from "@/features/contract";

export const metadata = {
  title: "Chi Tiết Hợp Đồng | NeuroBridge",
  description: "Chi tiết và ký hợp đồng dự án",
};

export default function ClientContractDetailPage() {
  return <ContractSigningView role="client" />;
}
