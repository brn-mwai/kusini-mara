import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import styles from "./Dropdown.module.scss";

type DropdownProps = {
  trigger: ReactElement<{ onClick?: () => void }>;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  width?: number;
};

// App-side dropdown container (as in twenty-front): positioning + dismissal here,
// contents are twenty-ui menu items.
export const Dropdown = ({
  trigger,
  children,
  align = "left",
  width = 200,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className={styles.root}>
      {cloneElement(trigger, { onClick: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={styles.panel}
          style={{ width, [align]: 0 } as React.CSSProperties}
          role="menu"
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
};
