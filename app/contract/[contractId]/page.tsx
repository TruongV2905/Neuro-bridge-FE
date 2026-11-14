import { ContractSigningView } from "@/features/contract";

export const metadata = {
  title: "Hợp Đồng Điện Tử Dự Án | NeuroBridge",
  description: "Ký kết hợp đồng điện tử và bảo chứng Escrow",
};

export default function UniversalContractPage() {
  return <ContractSigningView />;
}
