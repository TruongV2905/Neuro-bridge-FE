import { ExpertAiProductListView } from "@/features/ai-place/expert/ExpertAiProductListView";

export default async function ExpertAiProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page } = await searchParams;
  const parsedPage = Number(Array.isArray(page) ? page[0] : page);
  const normalizedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 0;

  return <ExpertAiProductListView page={normalizedPage} />;
}
