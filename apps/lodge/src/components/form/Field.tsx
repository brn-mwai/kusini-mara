import { IconChevronDown } from "@tabler/icons-react";
import { type ReactNode } from "react";

import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";

import { Dropdown } from "@/components/dropdown/Dropdown";

import styles from "./Field.module.scss";

type FieldShellProps = { label: string; children: ReactNode };

export const FieldShell = ({ label, children }: FieldShellProps) => (
  <label className={styles.field}>
    <span className={styles.label}>{label}</span>
    {children}
  </label>
);

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "datetime-local";
  min?: number;
};

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: TextFieldProps) => (
  <FieldShell label={label}>
    <input
      className={styles.input}
      type={type}
      value={value}
      min={min}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </FieldShell>
);

type SelectFieldProps = {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
};

export const SelectField = ({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) => {
  const active = options.find((o) => o.id === value);
  return (
    <FieldShell label={label}>
      <Dropdown
        width={220}
        trigger={
          <button type="button" className={styles.selectTrigger}>
            <span>{active?.label ?? "Select…"}</span>
            <IconChevronDown size={14} />
          </button>
        }
      >
        {(close) =>
          options.map((option) => (
            <MenuItemSelect
              key={option.id}
              text={option.label}
              selected={option.id === value}
              onClick={() => {
                onChange(option.id);
                close();
              }}
            />
          ))
        }
      </Dropdown>
    </FieldShell>
  );
};
