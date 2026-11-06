import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { IconDeviceFloppy, IconSettings } from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Banner } from "@ui/feedback/Banner/Banner";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { PageTabs, type PageTab } from "@/components/tabs/PageTabs";
import { SelectField, TextField } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import styles from "./SettingsPage.module.scss";

const ROLES = ["guide", "driver", "porter", "front_desk", "housekeeping"] as const;

const SETTINGS_TABS: PageTab[] = [
  { id: "coordination", label: "Coordination" },
  { id: "channels", label: "Channels" },
  { id: "privacy", label: "Privacy & data" },
  { id: "team", label: "Team" },
];

const CHANNELS = [
  { id: "sms", label: "SMS", provider: "Africa's Talking" },
  { id: "whatsapp", label: "WhatsApp", provider: "WhatsApp Business" },
  { id: "email", label: "Email", provider: "Resend" },
];

export const SettingsPage = () => {
  const data = useQuery(api.settings.get);
  const updateProperty = useMutation(api.settings.updateProperty);
  const setCoverageRule = useMutation(api.settings.setCoverageRule);

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [tabId, setTabId] = useState(
    SETTINGS_TABS.some((t) => t.id === initialTab) ? (initialTab as string) : "coordination",
  );
  const [escalation, setEscalation] = useState<string | null>(null);
  const [reportOffset, setReportOffset] = useState<string | null>(null);
  const [dutyContact, setDutyContact] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading settings…" />;
  if (data === null) return <PageUnseeded />;

  const { property, operator, users, coverageRules } = data;

  const escalationValue = escalation ?? String(property.escalationWindowMinutes);
  const reportValue = reportOffset ?? String(property.defaultReportOffsetMinutes);
  const contactValue = dutyContact ?? property.dutyContactUserId ?? "";

  const save = async () => {
    setError(null);
    setSaved(false);
    try {
      await updateProperty({
        escalationWindowMinutes: Number(escalationValue),
        defaultReportOffsetMinutes: Number(reportValue),
        dutyContactUserId: contactValue || undefined,
      });
      setSaved(true);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const ruleFor = (role: string) => coverageRules.find((r) => r.role === role);

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconSettings}
        title="Settings"
        actions={
          tabId === "coordination" ? (
            <Button
              type="button"
              title="Save"
              Icon={IconDeviceFloppy}
              variant="primary"
              accent="blue"
              size="small"
              onClick={() => void save()}
            />
          ) : undefined
        }
      />
      <PageTabs tabs={SETTINGS_TABS} activeId={tabId} onChange={setTabId} />
      {saved && (
        <Banner color="blue">
          <span className={pageStyles.bannerText}>Saved.</span>
        </Banner>
      )}
      {error && (
        <Banner color="danger">
          <span className={pageStyles.bannerText}>{error}</span>
        </Banner>
      )}
      <div className={styles.scroll}>
        {tabId === "coordination" && (
          <>
            <div className={styles.card}>
              <H2Title title={property.name} description={`${operator.name} · ${property.region.replace(/_/g, " ")} · ${property.timezone}`} />
              <div className={styles.grid}>
                <TextField
                  label="Escalation window (minutes)"
                  type="number"
                  min={10}
                  value={escalationValue}
                  onChange={setEscalation}
                />
                <TextField
                  label="Guest report offset (minutes early)"
                  type="number"
                  min={0}
                  value={reportValue}
                  onChange={setReportOffset}
                />
                <SelectField
                  label="Duty contact"
                  value={contactValue}
                  options={users.map((u) => ({ id: u.id, label: `${u.name} (${u.role.replace(/_/g, " ")})` }))}
                  onChange={setDutyContact}
                />
              </div>
            </div>

            <div className={styles.card}>
              <H2Title title="Coverage rules" description="Minimum staff per role — drives leave conflict checks" />
              <div className={styles.rules}>
                {ROLES.map((role) => {
                  const rule = ruleFor(role);
                  return (
                    <div key={role} className={styles.rule}>
                      <Tag color="blue" text={role.replace(/_/g, " ")} />
                      <TextField
                        label="Min staff"
                        type="number"
                        min={0}
                        value={String(rule?.minStaff ?? 0)}
                        onChange={(v) =>
                          void setCoverageRule({
                            role,
                            minStaff: Number(v) || 0,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tabId === "channels" && (
          <div className={styles.card}>
            <H2Title title="Channels" description="How nudges, escalations and confirmations reach people" />
            <div className={styles.rules}>
              {CHANNELS.map((ch) => (
                <div key={ch.id} className={styles.rule}>
                  <Tag color="gray" text={ch.label} />
                  <span className={pageStyles.muted}>{ch.provider}</span>
                  <Tag color="orange" text="Not configured" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tabId === "privacy" && (
          <div className={styles.card}>
            <H2Title title="Privacy & data" description="Data subject requests, retention and consent" />
            <div className={styles.rules}>
              <span className={pageStyles.muted}>
                No data subject requests yet. Guest export and erase actions land here when filed.
              </span>
            </div>
          </div>
        )}

        {tabId === "team" && (
          <div className={styles.card}>
            <H2Title title="Team" description="People with access to this workspace" />
            <div className={styles.rules}>
              {users.map((u) => (
                <div key={u.id} className={styles.rule}>
                  <Avatar placeholder={u.name} placeholderColorSeed={u.id} size="sm" type="rounded" />
                  <span>{u.name}</span>
                  <Tag color="blue" text={u.role.replace(/_/g, " ")} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
