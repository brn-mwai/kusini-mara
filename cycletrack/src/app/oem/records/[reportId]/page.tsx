"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import QRCode from "qrcode";
import { Printer, Recycle } from "@phosphor-icons/react";
import { Button, Mono, PageHeader, Skeleton } from "@/app/components/ui";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";

// Print-styled chain of custody certificate with a verification QR.
export default function CertificatePage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const cert = useQuery(api.reports.certificate, { reportId });
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!cert) return;
    void QRCode.toDataURL(
      `${window.location.origin}/v/${cert.reportId}`,
      { margin: 0, width: 144 },
    ).then(setQr);
  }, [cert]);

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title="Chain of custody certificate"
          subtitle="Print or save as PDF — the QR resolves to the public verification page"
          primaryAction={
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
          }
        />
      </div>

      {cert === undefined ? (
        <Skeleton className="h-96 max-w-2xl" />
      ) : cert === null ? (
        <p className="text-[13px] text-ink-secondary">
          This certificate does not belong to your workspace.
        </p>
      ) : (
        <div className="print-sheet mx-auto max-w-2xl rounded-card border border-line bg-card p-10 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-ctl bg-brand text-white">
                <Recycle size={20} weight="bold" aria-hidden />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-ink">
                  Revlog · CycleTrack
                </div>
                <div className="text-[12px] text-ink-secondary">
                  Chain of custody certificate
                </div>
              </div>
            </div>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Verification QR code" className="size-24" />
            ) : (
              <Skeleton className="size-24" />
            )}
          </div>

          <dl className="mt-6 space-y-4">
            <CertRow label="Issued to">{cert.org}</CertRow>
            <CertRow label="Report ID">
              <Mono className="text-[14px] font-medium">{cert.reportId}</Mono>
            </CertRow>
            <CertRow label="Reporting period">
              <Mono>
                {formatDate(cert.periodStart)} – {formatDate(cert.periodEnd)}
              </Mono>
            </CertRow>
            <CertRow label="Events covered">
              <Mono>{formatNumber(cert.eventCount)}</Mono>
            </CertRow>
            <CertRow label="Content hash">
              <Mono className="break-all text-[12px]">{cert.contentHash}</Mono>
            </CertRow>
            <CertRow label="Issued">
              <Mono>{formatDateTime(cert.issuedAt)}</Mono>
            </CertRow>
          </dl>

          <p className="mt-8 border-t border-line pt-4 text-[11px] leading-4 text-ink-tertiary">
            This certificate summarises custody and unit events recorded on the
            CycleTrack registry for the period above. Verify its content hash at
            any time by scanning the QR code or visiting the verification link;
            a match confirms the underlying event history is unchanged since
            issue.
          </p>
        </div>
      )}
    </div>
  );
}

function CertRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
        {label}
      </dt>
      <dd className="text-right text-[13px] text-ink">{children}</dd>
    </div>
  );
}
