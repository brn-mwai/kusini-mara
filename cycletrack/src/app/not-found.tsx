import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="max-w-md rounded-card border border-line bg-card p-8 text-center shadow-sm">
        <div className="mono text-[26px] font-bold text-ink">404</div>
        <h1 className="text-card-title mt-2">This page does not exist</h1>
        <p className="mt-1.5 text-[13px] leading-5 text-ink-secondary">
          Check the link, or head back to the CycleTrack home page.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-9 items-center rounded-ctl bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand-hover"
        >
          Back to CycleTrack
        </Link>
      </div>
    </div>
  );
}
