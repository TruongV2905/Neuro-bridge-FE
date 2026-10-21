import { AiPlaceProductDetailFoundation } from "@/features/ai-place/components/AiPlaceProductDetailFoundation";

export default async function ClientAiPlaceProductPage({
  params,
}: PageProps<"/client/dashboard/ai-place/[productId]">) {
  const { productId } = await params;

  return <AiPlaceProductDetailFoundation productId={productId} />;
}
