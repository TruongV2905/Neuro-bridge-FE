import type { SubmissionPackageSummary } from "@/types/submission-package.type";

export function sortSubmissionPackagesByLatest(
  packages: SubmissionPackageSummary[],
) {
  return [...packages].sort((left, right) => {
    const versionDelta =
      getFiniteNumber(right.version) - getFiniteNumber(left.version);

    if (versionDelta !== 0) return versionDelta;

    const submittedAtDelta =
      getValidTimestamp(right.submittedAt) -
      getValidTimestamp(left.submittedAt);

    if (submittedAtDelta !== 0) return submittedAtDelta;

    return left.packageId.localeCompare(right.packageId);
  });
}

function getFiniteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function getValidTimestamp(value?: string | null) {
  if (!value) return 0;

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}
