"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import QRCode from "qrcode";
import { Printer } from "@phosphor-icons/react";
import { Button, Mono, PageHeader, Skeleton } from "@/app/components/ui";

function QrCell({ token }: { token: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(
      `${window.location.origin}/q/${token}`,
      { margin: 0, width: 96 },
    ).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);
  if (!src) return <Skeleton className="size-24" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`QR for token ${token}`} className="size-24" />;
}

export default function PrintSheet({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = use(params);
  const tokens = useQuery(api.labels.batchTokens, {
    batchId: batchId as Id<"labelBatches">,
  });
  const markPrinted = useMutation(api.labels.markPrinted);

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title="Print sheet"
          subtitle="One label per token — QR resolves to the public record once bound"
          primaryAction={
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                void markPrinted({ batchId: batchId as Id<"labelBatches"> });
                window.print();
              }}
            >
              Print
            </Button>
          }
        />
      </div>
      {tokens === undefined ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="print-sheet grid grid-cols-2 gap-3 rounded-card border border-line bg-card p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-4">
          {tokens
            .filter((t) => t.state !== "revoked")
            .map((t) => (
              <div
                key={t._id}
                className="flex flex-col items-center gap-2 rounded-ctl border border-line p-4"
              >
                <QrCell token={t.token} />
                <Mono className="text-[12px]">{t.token}</Mono>
                <span className="text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                  Revlog · CycleTrack
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
