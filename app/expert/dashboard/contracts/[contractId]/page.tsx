import { ContractSigningView } from "@/features/contract";

export const metadata = {
  title: "Ký Hợp Đồng Chuyên Gia | NeuroBridge",
  description: "Chi tiết và ký hợp đồng dự án dành cho chuyên gia",
};

export default function ExpertContractDetailPage() {
  return <ContractSigningView role="expert" />;
}
