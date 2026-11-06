import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { IconX } from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";

import { NAV_ENTRIES } from "@/objects/registry";

import styles from "./SearchPanel.module.scss";

export const SearchPanel = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useQuery(api.searchq.global, { q });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pageHits = NAV_ENTRIES.filter(
    (n) => q.length >= 2 && n.label.toLowerCase().includes(q.toLowerCase()),
  );

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <input
          ref={inputRef}
          className={styles.input}
          value={q}
          placeholder="Type anything..."
          onChange={(e) => setQ(e.target.value)}
        />
        <LightIconButton Icon={IconX} size="small" accent="tertiary" onClick={onClose} />
      </div>
      <div className={styles.body}>
        <div className={styles.sectionLabel}>Results</div>
        {pageHits.map(({ path, label, Icon }) => (
          <button key={path} type="button" className={styles.row} onClick={() => go(path)}>
            <Icon size={16} className={styles.rowIcon} />
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowKind}>· Page</span>
          </button>
        ))}
        {(results?.hits ?? []).map((hit) => (
          <button
            key={`${hit.kind}-${hit.id}`}
            type="button"
            className={styles.row}
            onClick={() => go(hit.path)}
          >
            <Avatar
              placeholder={hit.label}
              placeholderColorSeed={hit.id}
              size="sm"
              type="squared"
            />
            <span className={styles.rowLabel}>{hit.label}</span>
            <span className={styles.rowKind}>· {hit.kind}</span>
          </button>
        ))}
        {q.length >= 2 && pageHits.length === 0 && (results?.hits ?? []).length === 0 && (
          <div className={styles.empty}>No matches.</div>
        )}
      </div>
    </aside>
  );
};
