import { ClientPurchaseDetailView } from "@/features/ai-place/components/ClientPurchaseDetailView";

export default async function ClientAiPlacePurchaseDetailPage(
  props: PageProps<"/client/dashboard/ai-place/purchases/[purchaseId]">,
) {
  const { purchaseId } = await props.params;

  return <ClientPurchaseDetailView purchaseId={purchaseId} />;
}
