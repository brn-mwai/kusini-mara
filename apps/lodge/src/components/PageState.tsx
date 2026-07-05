import styles from "./pageStyles.module.scss";

export const PageLoading = ({ label }: { label: string }) => (
  <div className={styles.loading}>{label}</div>
);

export const PageUnseeded = () => (
  <div className={styles.loading}>No property yet — seed the backend to begin.</div>
);
