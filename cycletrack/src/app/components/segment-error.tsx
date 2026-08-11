"use client";

import { useEffect } from "react";
import { ErrorState } from "./ui";

// Shared segment error boundary body. Next passes the thrown error and a
// reset() that re-renders the segment — that is the retry.
export function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        message={
          error.message ||
          "An unexpected error interrupted this screen. Retrying usually recovers it."
        }
        onRetry={reset}
      />
    </div>
  );
}
