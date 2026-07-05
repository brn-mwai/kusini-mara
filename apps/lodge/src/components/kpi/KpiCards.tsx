import styles from "./KpiCards.module.scss";

export type Kpi = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "danger" | "success";
  onClick?: () => void;
  active?: boolean;
};

export const KpiCards = ({ kpis }: { kpis: Kpi[] }) => (
  <div className={styles.row}>
    {kpis.map((kpi) =>
      kpi.onClick ? (
        <button
          key={kpi.label}
          type="button"
          className={styles.card}
          data-tone={kpi.tone ?? "default"}
          data-active={kpi.active || undefined}
          onClick={kpi.onClick}
        >
          <span className={styles.value}>{kpi.value}</span>
          <span className={styles.label}>{kpi.label}</span>
          {kpi.hint && <span className={styles.hint}>{kpi.hint}</span>}
        </button>
      ) : (
        <div key={kpi.label} className={styles.card} data-tone={kpi.tone ?? "default"}>
          <span className={styles.value}>{kpi.value}</span>
          <span className={styles.label}>{kpi.label}</span>
          {kpi.hint && <span className={styles.hint}>{kpi.hint}</span>}
        </div>
      ),
    )}
  </div>
);
