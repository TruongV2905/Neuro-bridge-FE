import { redirect } from "next/navigation";

export default async function AiPlaceProductPage({
  params,
}: PageProps<"/ai-place/[productId]">) {
  const { productId } = await params;

  redirect(`/client/dashboard/ai-place/${encodeURIComponent(productId)}`);
}
