"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle, MagnifyingGlass, XCircle } from "@phosphor-icons/react";
import { PublicChrome } from "@/app/components/public-chrome";
import { EmptyState, Mono, Skeleton } from "@/app/components/ui";
import { formatDateTime, formatNumber } from "@/lib/format";

function Verification({ reportId }: { reportId: string }) {
  const result = useQuery(api.reports.verify, { reportId });

  return (
    <div className="mx-auto max-w-xl">
      {result === undefined ? (
        <div className="space-y-4">
          <Skeleton className="mx-auto h-24 w-24 rounded-full" />
          <Skeleton className="h-48" />
        </div>
      ) : !result.found ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="Report not found"
          body="No certificate with this ID exists on the registry. Check the link or QR and try again."
        />
      ) : (
        <div className="text-center">
          {result.match ? (
            <>
              <CheckCircle
                size={88}
                weight="fill"
                className="mx-auto text-success"
                aria-hidden
              />
              <h1 className="mt-3 text-[26px] font-semibold text-success">
                Records match
              </h1>
              <p className="mx-auto mt-1 max-w-md text-[13px] leading-5 text-ink-secondary">
                The event history behind this certificate re-hashes to the same
                content hash it was issued with.
              </p>
            </>
          ) : (
            <>
              <XCircle
                size={88}
                weight="fill"
                className="mx-auto text-danger"
                aria-hidden
              />
              <h1 className="mt-3 text-[26px] font-semibold text-danger">
                Records do not match
              </h1>
              <p className="mx-auto mt-1 max-w-md text-[13px] leading-5 text-ink-secondary">
                The registry&apos;s event history no longer re-hashes to this
                certificate&apos;s content hash. Treat the certificate as stale
                and request a fresh one.
              </p>
            </>
          )}

          <dl className="mt-8 space-y-3 rounded-card border border-line bg-card p-5 text-left shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Report ID
              </dt>
              <dd>
                <Mono className="text-[14px] font-medium">{result.reportId}</Mono>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Content hash
              </dt>
              <dd className="min-w-0">
                <Mono className="block break-all text-right text-[12px]">
                  {result.contentHash}
                </Mono>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Events covered
              </dt>
              <dd>
                <Mono>{formatNumber(result.eventCount)}</Mono>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Issued
              </dt>
              <dd>
                <Mono>{formatDateTime(result.issuedAt)}</Mono>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  return (
    <PublicChrome>
      <Verification reportId={reportId} />
    </PublicChrome>
  );
}
