"use client";

import { SegmentError } from "@/app/components/segment-error";

export default function ConsoleError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} />;
}
