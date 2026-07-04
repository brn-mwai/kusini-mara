import { H2Title } from "@ui/typography/H2Title/H2Title";

export const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: "var(--t-spacing-6)" }}>
    <H2Title title={title} description="Coming next in the Lodge build." />
  </div>
);
