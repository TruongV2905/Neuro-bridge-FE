import { ExpertAiProductDetailView } from "@/features/ai-place/expert/ExpertAiProductDetailView";

export default async function ExpertAiProductPage({
  params,
}: PageProps<"/expert/dashboard/ai-place/products/[productId]">) {
  const { productId } = await params;

  return <ExpertAiProductDetailView productId={productId} />;
}
