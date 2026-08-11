import Link from "next/link";

const SURFACES = [
  {
    href: "/impact",
    title: "Impact",
    body: "What a kilogram of returned batteries avoids and recovers.",
  },
  {
    href: "/oem",
    title: "Producer console",
    body: "Registration, collection and compliance for producers.",
  },
  {
    href: "/partners",
    title: "Partner console",
    body: "Graded stock for second-life buyers and recyclers.",
  },
  {
    href: "/field",
    title: "Field",
    body: "Collection crew app — installable, works offline.",
  },
  {
    href: "/admin",
    title: "Control tower",
    body: "Network-wide registry, custody and verification.",
  },
];

// Static landing; each console mounts its own providers.
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-[28px] font-semibold tracking-[-0.01em] text-ink">
        CycleTrack <span className="font-normal text-ink-tertiary">by Revlog</span>
      </h1>
      <p className="mt-2 max-w-xl text-[14px] leading-6 text-ink-secondary">
        Battery traceability from first registration to final disposition — one
        registry, five surfaces.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SURFACES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-card border border-line bg-card p-5 shadow-sm transition-colors hover:border-brand"
          >
            <div className="text-card-title">{s.title}</div>
            <p className="mt-1 text-[13px] leading-5 text-ink-secondary">
              {s.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
