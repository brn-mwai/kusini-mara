import styles from "./KpiCards.module.scss";

export type Kpi = { label: string; value: number | string; tone?: "default" | "danger" | "success" };

export const KpiCards = ({ kpis }: { kpis: Kpi[] }) => (
  <div className={styles.row}>
    {kpis.map((kpi) => (
      <div key={kpi.label} className={styles.card} data-tone={kpi.tone ?? "default"}>
        <span className={styles.value}>{kpi.value}</span>
        <span className={styles.label}>{kpi.label}</span>
      </div>
    ))}
  </div>
);
