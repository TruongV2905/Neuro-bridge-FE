import Link from "next/link";

type ExpertDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpertDetailPage({ params }: ExpertDetailPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-28">
      <div className="max-w-lg rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">AI Expert</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Expert profile</h1>
        <p className="mt-4 text-slate-600">
          Profile <span className="font-semibold text-slate-900">{id}</span> is ready for detailed
          information and booking integration.
        </p>
        <Link
          href="/experts"
          className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Back to experts
        </Link>
      </div>
    </main>
  );
}
