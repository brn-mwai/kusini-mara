"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Shell,
  Stat,
  Panel,
  Pill,
  Btn,
  Modal,
  Field,
  EmptyState,
  DataTable,
  Select,
  TimeField,
  useToast,
  fmt,
  type NavSection,
  type CmdItem,
  type PillTone,
} from "@/uikit";

type Me = {
  name: string;
  role: string;
  org: { name: string; type: "airline" | "lodge"; shortCode: string };
};

const NAV: NavSection[] = [
  {
    sec: "Operations",
    items: [
      { key: "acks", label: "Acknowledge", icon: "ph-check-square" },
      { key: "flights", label: "Flights", icon: "ph-airplane-in-flight" },
      { key: "requests", label: "Requests", icon: "ph-tray-arrow-down" },
    ],
  },
  {
    sec: "Strip",
    items: [{ key: "strips", label: "Strip conditions", icon: "ph-map-pin" }],
  },
  {
    sec: "Fleet",
    items: [
      { key: "aircraft", label: "Aircraft", icon: "ph-airplane-tilt" },
      { key: "pilots", label: "Pilots", icon: "ph-users-three" },
    ],
  },
  { sec: "Insights", items: [{ key: "reports", label: "Reports", icon: "ph-chart-bar" }] },
];

const TITLES: Record<string, string> = {
  acks: "Acknowledge",
  flights: "Flights",
  requests: "Requests",
  strips: "Strip conditions",
  aircraft: "Aircraft",
  pilots: "Pilots",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
};

function flightStatusPill(s: string): [PillTone, string, string] {
  if (s === "in_flight") return ["info", "ph-airplane-in-flight", "In flight"];
  if (s === "completed") return ["mut", "ph-check", "Completed"];
  if (s === "boarding") return ["warn", "ph-users", "Boarding"];
  if (s === "cancelled") return ["mut", "ph-x", "Cancelled"];
  return ["mut", "ph-clock", "Planned"];
}

function legStatusPill(m: any): [PillTone, string, string] {
  if (m.status === "escalated") return ["risk", "ph-warning", "escalated"];
  if (m.status === "reconfirm_required" || m.reconfirmRequested) return ["warn", "ph-arrows-clockwise", "reconfirm"];
  if (m.status === "acknowledged" || m.status === "in_transit") return ["ok", "ph-check", m.status];
  if (m.status === "completed") return ["mut", "ph-check", "completed"];
  return ["warn", "ph-bell-ringing", m.status];
}

const CONDITIONS = ["open", "restricted", "waterlogged", "closed"] as const;
function conditionPill(c: string | null | undefined): [PillTone, string] {
  if (c === "waterlogged" || c === "closed") return ["risk", c];
  if (c === "restricted") return ["warn", c];
  return ["ok", c ?? "open"];
}

export function Dashboard({ me }: { me: Me }) {
  const [view, setView] = useState("acks");
  const flights = useQuery(api.flights.board, {}) ?? [];
  const requests = useQuery(api.flights.requests, {}) ?? [];
  const pendingAcks = useQuery(api.airstrip.pendingAcks, {}) ?? [];
  const notifs = useQuery(api.notifications.list, { app: "air" }) ?? [];

  const escalated = flights.filter((f: any) => f.escalated).length;

  const paletteItems: CmdItem[] = useMemo(() => {
    const nav: CmdItem[] = Object.keys(TITLES).map((k) => ({
      id: "nav-" + k,
      label: TITLES[k] ?? k,
      icon: NAV.flatMap((s) => s.items).find((i) => i.key === k)?.icon ?? "ph-arrow-right",
      section: "Navigate",
      run: () => setView(k),
    }));
    const fl: CmdItem[] = flights.map((f: any) => ({
      id: "fl-" + f._id,
      label: `${f.aircraftReg} · ${f.code}`,
      icon: "ph-airplane-tilt",
      section: "Flights",
      sub: `${f.ackCount}/${f.legCount} acked`,
      run: () => setView("flights"),
    }));
    return [...nav, ...fl];
  }, [flights]);

  return (
    <Shell
      appName="Kusini Airstrip"
      shortCode={me.org.shortCode}
      navSections={NAV.map((s) => ({
        ...s,
        items: s.items.map((i) => {
          if (i.key === "requests" && requests.length) return { ...i, badge: requests.length };
          if (i.key === "acks" && pendingAcks.length) return { ...i, badge: pendingAcks.length };
          return i;
        }),
      }))}
      recents={[
        { code: "5Y-BMF", label: "in flight" },
        { code: "5Y-CAC", label: "planned" },
      ]}
      activePage={view}
      crumbPage={TITLES[view] ?? "Acknowledge"}
      onNavigate={setView}
      user={{ name: me.name, sub: `${me.role} · ${me.org.name}`, initials: fmt.initials(me.name) }}
      pilot={{ icon: "ph-airplane-tilt", label: "Fleet today", fill: 60, meta: `${flights.filter((f: any) => f.status === "in_flight").length} flying` }}
      bellBadge={escalated + requests.length + pendingAcks.length || undefined}
      paletteItems={paletteItems}
    >
      {view === "acks" && <AcksView pending={pendingAcks} />}
      {view === "flights" && <FlightsView flights={flights} />}
      {view === "requests" && <RequestsView requests={requests} flights={flights} />}
      {view === "strips" && <StripsView />}
      {view === "aircraft" && <AircraftView />}
      {view === "pilots" && <PilotsView />}
      {view === "reports" && <ReportsView flights={flights} requests={requests} />}
      {view === "notifications" && <NotificationsView notifs={notifs} />}
      {view === "settings" && <SettingsView me={me} />}
    </Shell>
  );
}

// ── Acknowledge (the strip side's inbox: movements assigned to it) ────────────
function AcksView({ pending }: { pending: any[] }) {
  const [ackFor, setAckFor] = useState<any | null>(null);
  const [reprotectFor, setReprotectFor] = useState<any | null>(null);
  const escalated = pending.filter((m) => m.status === "escalated").length;
  const reconfirm = pending.filter((m) => m.status === "reconfirm_required" || m.reconfirmRequested).length;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Acknowledge</h1>
          <p className="page-subtitle">Movements assigned to the strip side — confirm and set the pickup time</p>
        </div>
      </div>

      <div className="stats">
        <Stat icon="ph-bell-ringing" tone="amber" label="Awaiting your ack" value={pending.length} sub="acknowledge & set pickup time" />
        <Stat icon="ph-arrows-clockwise" tone="amber" label="Reconfirm" value={reconfirm} sub="retimed or re-protected" />
        <Stat icon="ph-warning" tone="red" label="Escalated" value={escalated} sub="unacknowledged in window" />
        <Stat icon="ph-airplane-landing" tone="blue" label="Strips served" value={new Set(pending.map((m) => m.stripName)).size} />
      </div>

      <DataTable<any>
        rows={pending}
        noun="movement"
        getRowKey={(m) => m._id}
        searchText={(m) => `${m.guestName} ${m.propertyName} ${m.stripName}`}
        searchPlaceholder="Search guest, lodge, strip…"
        rowClassName={(m) => (m.status === "escalated" ? "esc" : "attn")}
        empty={{ icon: "ph-check-circle", title: "Nothing awaiting acknowledgment." }}
        columns={[
          { key: "guest", label: "Guest", render: (m) => (<><div className="flt">{m.guestName}</div><div className="reg">{m.pax} pax · {m.propertyName}</div></>) },
          {
            key: "strip", label: "Airstrip",
            render: (m) => (<><div className="flt">{m.stripName}</div>{m.stripCondition && m.stripCondition !== "open" ? <div className="reg" style={{ color: "var(--risk-fg)" }}>{m.stripCondition}</div> : null}</>),
          },
          {
            key: "leg", label: "Leg",
            render: (m) => (<span className="route"><i className={`ph ${m.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} />{m.direction}</span>),
          },
          { key: "carrier", label: "Carrier", render: (m) => m.carrierName ? (<><div className="flt">{m.carrierName}</div><div className="reg">re-protected ×{m.reprotectCount ?? 1}</div></>) : <span className="reg">own metal</span> },
          { key: "time", label: "Proposed pickup", align: "right", render: (m) => <span className="mono">{fmt.hhmm(m.pickupTime)}</span> },
          { key: "status", label: "Status", render: (m) => { const [t, i, l] = legStatusPill(m); return <Pill tone={t} icon={i}>{l}</Pill>; } },
          {
            key: "act", label: "", align: "right",
            render: (m) => (
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <Btn icon="ph-arrows-clockwise" onClick={() => setReprotectFor(m)}>Re-protect</Btn>
                <button className="ackbtn" onClick={() => setAckFor(m)}>
                  <i className="ph ph-check" />{m.status === "reconfirm_required" || m.reconfirmRequested ? "Reconfirm" : "Acknowledge"}
                </button>
              </div>
            ),
          },
        ]}
      />
      {ackFor && <StripAckModal movement={ackFor} onClose={() => setAckFor(null)} />}
      {reprotectFor && <ReprotectModal movement={reprotectFor} onClose={() => setReprotectFor(null)} />}
    </>
  );
}

// Acknowledge + set the pickup time — the strip side's half of the handshake.
function StripAckModal({ movement, onClose }: { movement: any; onClose: () => void }) {
  const acknowledge = useMutation(api.airstrip.acknowledge);
  const toast = useToast();
  const proposed = new Date(movement.pickupTime ?? movement.scheduledTime);
  const [hh, setHh] = useState(String(proposed.getHours()).padStart(2, "0"));
  const [mm, setMm] = useState(String(proposed.getMinutes()).padStart(2, "0"));

  const submit = async () => {
    const t = new Date(movement.pickupTime ?? movement.scheduledTime);
    t.setHours(Number(hh), Number(mm), 0, 0);
    try {
      await acknowledge({ arrivalId: movement._id, pickupTime: t.getTime() });
      toast(`Acknowledged — pickup ${fmt.hhmm(t.getTime())}`, "ph-check-circle");
      onClose();
    } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <Modal title={`Acknowledge · ${movement.guestName}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Confirm pickup time</Btn></>}>
      <p className="reg" style={{ marginBottom: 10 }}>
        {movement.propertyName} · {movement.stripName} · {movement.pax} pax. Confirm the strip has this movement and set the vehicle-meets-guests time. Proposed: <span className="mono">{fmt.hhmm(movement.pickupTime ?? movement.scheduledTime)}</span>.
      </p>
      <Field label="Pickup time">
        <TimeField hour={hh} minute={mm} onChange={(h, m) => { setHh(h); setMm(m); }} />
      </Field>
    </Modal>
  );
}

// Re-protect: carrier/strip/time change — voids the prior ack, re-notifies both sides.
function ReprotectModal({ movement, onClose }: { movement: any; onClose: () => void }) {
  const reprotect = useMutation(api.airstrip.reprotect);
  const toast = useToast();
  const [carrier, setCarrier] = useState("");
  const [opsContact, setOpsContact] = useState("");
  const [reason, setReason] = useState("");
  const when = new Date(movement.scheduledTime);
  const [hh, setHh] = useState(String(when.getHours()).padStart(2, "0"));
  const [mm, setMm] = useState(String(when.getMinutes()).padStart(2, "0"));

  const submit = async () => {
    const t = new Date(movement.scheduledTime);
    t.setHours(Number(hh), Number(mm), 0, 0);
    try {
      await reprotect({
        arrivalId: movement._id,
        carrierName: carrier || undefined,
        carrierOpsContact: opsContact || undefined,
        scheduledTime: t.getTime(),
        reason: reason || undefined,
      });
      toast(`${movement.guestName} re-protected`, "ph-arrows-clockwise");
      onClose();
    } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <Modal title={`Re-protect · ${movement.guestName}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-arrows-clockwise" onClick={submit}>Re-protect</Btn></>}>
      <p className="reg" style={{ marginBottom: 10 }}>
        Changes the carrier/time and voids the prior acknowledgment — both sides are re-notified and must re-confirm.
      </p>
      <Field label="New carrier (blank = keep)"><input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. Safarilink" /></Field>
      <Field label="Carrier ops contact"><input value={opsContact} onChange={(e) => setOpsContact(e.target.value)} placeholder="+254…" /></Field>
      <Field label="New time">
        <TimeField hour={hh} minute={mm} onChange={(h, m) => { setHh(h); setMm(m); }} />
      </Field>
      <Field label="Reason"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. aircraft tech stop" /></Field>
    </Modal>
  );
}

// ── Strip conditions (the strip's live operability register) ──────────────────
function StripsView() {
  const strips = useQuery(api.airstrip.strips, {}) ?? [];
  const [editFor, setEditFor] = useState<any | null>(null);
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Strip conditions</h1>
          <p className="page-subtitle">Live operability — a degraded strip alerts every lodge that uses it</p>
        </div>
      </div>
      <DataTable<any>
        rows={strips}
        noun="airstrip"
        getRowKey={(s) => s._id}
        searchText={(s) => `${s.name} ${s.code ?? ""} ${s.region}`}
        empty={{ icon: "ph-map-pin", title: "No airstrips on record." }}
        columns={[
          { key: "name", label: "Airstrip", render: (s) => (<><div className="flt">{s.name}</div><div className="reg mono">{s.code ?? "—"}</div></>) },
          { key: "region", label: "Region", render: (s) => s.region },
          { key: "surface", label: "Surface", render: (s) => s.surface ?? <span className="reg">—</span> },
          {
            key: "condition", label: "Condition",
            render: (s) => { const [tone, label] = conditionPill(s.condition); return <Pill tone={tone} icon="ph-traffic-cone">{label}</Pill>; },
          },
          { key: "note", label: "Note", render: (s) => s.conditionNote ?? <span className="reg">—</span> },
          {
            key: "act", label: "", align: "right",
            render: (s) => (
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <Btn icon="ph-pencil-simple" onClick={() => setEditFor(s)}>Update</Btn>
              </div>
            ),
          },
        ]}
      />
      {editFor && <ConditionModal strip={editFor} onClose={() => setEditFor(null)} />}
    </>
  );
}

function ConditionModal({ strip, onClose }: { strip: any; onClose: () => void }) {
  const setCondition = useMutation(api.airstrip.setCondition);
  const toast = useToast();
  const [condition, setConditionValue] = useState<string>(strip.condition ?? "open");
  const [note, setNote] = useState(strip.conditionNote ?? "");
  const submit = async () => {
    try {
      await setCondition({ airstripId: strip._id, condition: condition as any, note: note || undefined });
      toast(`${strip.name} set to ${condition}`, "ph-traffic-cone");
      onClose();
    } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };
  return (
    <Modal title={`Condition · ${strip.name}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Set condition</Btn></>}>
      <Field label="Condition">
        <Select value={condition} onChange={setConditionValue}
          options={CONDITIONS.map((c) => ({ value: c, label: c }))} />
      </Field>
      <Field label="Note"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. soft after rain — 4x4 only" /></Field>
      <p className="reg" style={{ marginTop: 4 }}>Anything other than open sends an SMS heads-up to every lodge linked to this strip.</p>
    </Modal>
  );
}

// ── Flights board ─────────────────────────────────────────────────────────────
function FlightsView({ flights }: { flights: any[] }) {
  const dispatch = useMutation(api.flights.dispatch);
  const land = useMutation(api.flights.land);
  const toast = useToast();
  const [manifestFor, setManifestFor] = useState<any | null>(null);

  const flying = flights.filter((f) => f.status === "in_flight").length;
  const awaiting = flights.reduce((s, f) => s + (f.legCount - f.ackCount), 0);
  const escal = flights.filter((f) => f.escalated).length;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Flights</h1>
          <p className="page-subtitle">
            One aircraft carries many movements — arrivals and departures, across lodges
          </p>
        </div>
      </div>

      <div className="stats">
        <Stat icon="ph-airplane-in-flight" tone="blue" label="In flight" value={flying} />
        <Stat icon="ph-airplane" tone="green" label="Flights today" value={flights.length} />
        <Stat icon="ph-bell-ringing" tone="amber" label="Awaiting ack" value={awaiting} sub={`${escal} with escalation`} />
        <Stat icon="ph-warning" tone="red" label="Escalated" value={escal} />
      </div>

      <DataTable<any>
        rows={flights}
        noun="flight"
        getRowKey={(f) => f._id}
        searchText={(f) => `${f.aircraftReg} ${f.code} ${f.pilotName} ${f.circuit.join(" ")}`}
        searchPlaceholder="Search tail, flight, pilot, strip…"
        onRowClick={(f) => setManifestFor(f)}
        rowClassName={(f) =>
          [manifestFor?._id === f._id ? "sel" : "", f.escalated ? "esc" : f.legCount > f.ackCount ? "attn" : ""]
            .filter(Boolean).join(" ")}
        empty={{ icon: "ph-airplane", title: "No flights yet — schedule a request." }}
        columns={[
          {
            key: "flight", label: "Flight",
            render: (f) => (<><div className="flt mono">{f.aircraftReg}</div><div className="reg">{f.code}</div></>),
          },
          {
            key: "pilot", label: "Pilot",
            render: (f) => (<div className="assign"><span className="av">{fmt.initials(f.pilotName)}</span>{f.pilotName}</div>),
          },
          {
            key: "circuit", label: "Circuit",
            render: (f) => (
              <div className="route" style={{ flexWrap: "wrap" }}>
                {f.circuit.length
                  ? f.circuit.map((s: string, i: number) => (<span key={s}>{i > 0 && <span className="ar"> → </span>}{s}</span>))
                  : <span className="reg">no legs yet</span>}
              </div>
            ),
          },
          {
            key: "departs", label: "Departs",
            render: (f) => (<><div className="eta mono">{fmt.hhmm(f.departTime)}</div><div className="cd">{f.base} base</div></>),
          },
          {
            key: "manifest", label: "Manifest",
            render: (f) => f.legCount
              ? (<><div className="flt">{f.legCount} guests · {f.pax} pax</div><div className="reg">{f.mixed && <span className="tag">in + out</span>}{f.pax} / {f.seats} seats</div></>)
              : (<span className="reg">empty</span>),
          },
          {
            key: "acks", label: "Lodge acks",
            render: (f) => {
              if (!f.legCount) return <span className="reg">—</span>;
              const ackTone: PillTone = f.escalated ? "risk" : f.ackCount === f.legCount ? "ok" : "warn";
              const ackIcon = f.escalated ? "ph-warning" : f.ackCount === f.legCount ? "ph-check" : "ph-bell-ringing";
              return <Pill tone={ackTone} icon={ackIcon}>{f.ackCount} / {f.legCount} acked</Pill>;
            },
          },
          {
            key: "status", label: "Status",
            render: (f) => { const [tone, icon, label] = flightStatusPill(f.status); return <Pill tone={tone} icon={icon}>{label}</Pill>; },
          },
          {
            key: "act", label: "", align: "right",
            render: (f) => (
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <Btn icon="ph-list-bullets" onClick={() => setManifestFor(f)}>Manifest</Btn>
                {f.status === "planned" && (
                  <button className="ackbtn" onClick={async () => { await dispatch({ flightId: f._id }); toast(`${f.aircraftReg} dispatched`, "ph-airplane-takeoff"); }}>
                    <i className="ph ph-airplane-takeoff" />Dispatch
                  </button>
                )}
                {f.status === "in_flight" && (
                  <Btn icon="ph-flag-checkered" onClick={async () => { await land({ flightId: f._id }); toast(`${f.aircraftReg} landed`, "ph-flag-checkered"); }}>Land</Btn>
                )}
              </div>
            ),
          },
        ]}
      />

      {manifestFor && <ManifestModal flight={manifestFor} onClose={() => setManifestFor(null)} />}
    </>
  );
}

function ManifestModal({ flight, onClose }: { flight: any; onClose: () => void }) {
  const acknowledge = useMutation(api.airstrip.acknowledge);
  const markLanded = useMutation(api.airstrip.markLanded);
  const toast = useToast();
  const legs = [...flight.legs].sort((a: any, b: any) => a.scheduledTime - b.scheduledTime);

  const canStripAck = (m: any) =>
    m.assignedToSide === "airstrip" && ["scheduled", "reconfirm_required", "escalated"].includes(m.status);
  const canLand = (m: any) => ["acknowledged", "in_transit"].includes(m.status) && !m.landedAt;

  const onAck = async (m: any) => {
    try { await acknowledge({ arrivalId: m.id }); toast(`Acknowledged ${m.guestName}`, "ph-check-circle"); }
    catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };
  const onLand = async (m: any) => {
    try { await markLanded({ arrivalId: m.id }); toast(`${m.guestName} landed at ${m.airstrip}`, "ph-airplane-landing"); }
    catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <Modal title={`Manifest · ${flight.aircraftReg} (${flight.code})`} onClose={onClose} wide
      footer={<Btn variant="primary" onClick={onClose}>Close</Btn>}>
      {legs.length === 0 ? (
        <EmptyState icon="ph-users">No legs on this flight.</EmptyState>
      ) : (
        <table>
          <thead><tr><th>Guest</th><th>Leg</th><th>Airstrip</th><th>Pax</th><th>Pickup</th><th>Status</th><th /></tr></thead>
          <tbody>
            {legs.map((m: any) => {
              const [tone, icon, label] = legStatusPill(m);
              return (
                <tr key={m.id}>
                  <td className="flt">{m.guestName}</td>
                  <td>
                    <span className="route">
                      <i className={`ph ${m.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} />
                      {m.direction === "arrival" ? "drop" : "pick-up"}
                    </span>
                  </td>
                  <td>{m.airstrip}</td>
                  <td>{m.pax}</td>
                  <td className="mono">
                    {m.confirmedPickupTime
                      ? fmt.hhmm(m.confirmedPickupTime)
                      : m.proposedPickupTime
                        ? `${fmt.hhmm(m.proposedPickupTime)}?`
                        : "—"}
                  </td>
                  <td><Pill tone={tone} icon={icon}>{label}</Pill></td>
                  <td>
                    <div className="row-actions">
                      {canStripAck(m) && (
                        <button className="ackbtn" onClick={() => onAck(m)}><i className="ph ph-check" />Ack</button>
                      )}
                      {canLand(m) && <Btn icon="ph-airplane-landing" onClick={() => onLand(m)}>Landed</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

// ── Requests queue ────────────────────────────────────────────────────────────
function RequestsView({ requests, flights }: { requests: any[]; flights: any[] }) {
  const [scheduleFor, setScheduleFor] = useState<any | null>(null);
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Requests</h1>
          <p className="page-subtitle">Movements awaiting a flight — schedule them onto an aircraft</p>
        </div>
      </div>
      <DataTable<any>
        rows={requests}
        noun="request"
        getRowKey={(m) => m._id}
        searchText={(m) => `${m.guestName} ${m.propertyName} ${m.destinationLabel} ${m.direction}`}
        searchPlaceholder="Search guest, lodge, airstrip…"
        onRowClick={(m) => setScheduleFor(m)}
        rowClassName={() => "attn"}
        empty={{ icon: "ph-tray", title: "Queue is clear." }}
        columns={[
          { key: "guest", label: "Guest", render: (m) => <span className="flt">{m.guestName}</span> },
          { key: "lodge", label: "Property", render: (m) => m.propertyName },
          {
            key: "leg", label: "Leg",
            render: (m) => (<span className="route"><i className={`ph ${m.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} />{m.direction}</span>),
          },
          { key: "strip", label: "Airstrip", render: (m) => m.destinationLabel },
          { key: "pax", label: "Pax", align: "right", render: (m) => <span className="mono">{m.pax}</span> },
          { key: "wanted", label: "Wanted", align: "right", render: (m) => <span className="mono">{fmt.hhmm(m.scheduledTime)}</span> },
          {
            key: "act", label: "", align: "right",
            render: (m) => (
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <button className="ackbtn" onClick={() => setScheduleFor(m)}><i className="ph ph-calendar-plus" />Schedule</button>
              </div>
            ),
          },
        ]}
      />
      {scheduleFor && (
        <ScheduleModal movement={scheduleFor} flights={flights} onClose={() => setScheduleFor(null)} />
      )}
    </>
  );
}

function ScheduleModal({ movement, flights, onClose }: { movement: any; flights: any[]; onClose: () => void }) {
  const schedule = useMutation(api.flights.scheduleArrival);
  const build = useMutation(api.flights.buildFlight);
  const aircraft = useQuery(api.fleet.aircraft, {}) ?? [];
  const pilots = useQuery(api.fleet.pilots, {}) ?? [];
  const toast = useToast();

  const openFlights = flights.filter((f) => f.status === "planned" || f.status === "boarding");
  const [mode, setMode] = useState<"existing" | "new">(openFlights.length ? "existing" : "new");
  const [flightId, setFlightId] = useState<string>(openFlights[0]?._id ?? "");
  const [code, setCode] = useState(`F-${100 + Math.floor((Date.now() / 1000) % 900)}`);
  const [reg, setReg] = useState<string>(aircraft[0]?.reg ?? "");
  const [pilot, setPilot] = useState<string>(pilots[0]?.name ?? "");
  const [hh, setHh] = useState("11");
  const [mm, setMm] = useState("30");

  const submit = async () => {
    try {
      let fid = flightId as Id<"flights">;
      if (mode === "new") {
        const midnight = new Date();
        midnight.setHours(Number(hh), Number(mm), 0, 0);
        fid = await build({ code, aircraftReg: reg, pilotName: pilot, departTime: midnight.getTime() });
      }
      await schedule({ arrivalId: movement._id, flightId: fid });
      toast(`${movement.guestName} scheduled`, "ph-calendar-check");
      onClose();
    } catch (e: any) {
      toast(e.message ?? "Failed", "ph-warning");
    }
  };

  return (
    <Modal
      title={`Schedule · ${movement.guestName} (${movement.direction})`}
      onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Schedule</Btn></>}
    >
      <div className="tabs" style={{ marginBottom: 14 }}>
        <button className={`tab${mode === "existing" ? " active" : ""}`} onClick={() => setMode("existing")} disabled={!openFlights.length}>
          Existing flight
        </button>
        <button className={`tab${mode === "new" ? " active" : ""}`} onClick={() => setMode("new")}>New flight</button>
      </div>

      {mode === "existing" ? (
        <Field label="Flight">
          <Select value={flightId} onChange={setFlightId} placeholder="Select flight…"
            options={openFlights.map((f) => ({ value: f._id, label: `${f.aircraftReg} · ${f.code} · ${fmt.hhmm(f.departTime)} (${f.legCount} legs)` }))} />
        </Field>
      ) : (
        <>
          <Field label="Flight code"><input value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <Field label="Aircraft">
            <Select value={reg} onChange={setReg} placeholder="Select aircraft…"
              options={aircraft.map((a: any) => ({ value: a.reg, label: `${a.reg} — ${a.type} (${a.seats} seats)` }))} />
          </Field>
          <Field label="Pilot">
            <Select value={pilot} onChange={setPilot} placeholder="Select pilot…"
              options={pilots.map((p: any) => ({ value: p.name, label: `${p.name} — ${p.license}` }))} />
          </Field>
          <Field label="Departure">
            <TimeField hour={hh} minute={mm} onChange={(h, m) => { setHh(h); setMm(m); }} />
          </Field>
        </>
      )}
      <p className="reg" style={{ marginTop: 8 }}>
        {movement.propertyName} · {movement.destinationLabel} · {movement.pax} pax
      </p>
    </Modal>
  );
}

// ── Aircraft / Pilots ─────────────────────────────────────────────────────────
function AircraftView() {
  const aircraft = useQuery(api.fleet.aircraft, {}) ?? [];
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Aircraft</h1><p className="page-subtitle">Fleet register</p></div></div>
      <Panel title="Fleet">
        <table>
          <thead><tr><th>Reg</th><th>Type</th><th>Seats</th><th>Base</th><th>Status</th></tr></thead>
          <tbody>
            {aircraft.map((a: any) => (
              <tr key={a._id}>
                <td className="flt mono">{a.reg}</td>
                <td>{a.type}</td>
                <td>{a.seats}</td>
                <td>{a.base}</td>
                <td><Pill tone={a.status === "in_service" ? "ok" : a.status === "maintenance" ? "risk" : "info"} icon="ph-wrench">{a.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

function PilotsView() {
  const pilots = useQuery(api.fleet.pilots, {}) ?? [];
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Pilots</h1><p className="page-subtitle">Crew register</p></div></div>
      <Panel title="Crew">
        <table>
          <thead><tr><th>Name</th><th>License</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            {pilots.map((p: any) => (
              <tr key={p._id}>
                <td className="flt">{p.name}</td>
                <td>{p.license}</td>
                <td className="mono">{p.hours.toLocaleString()}</td>
                <td><Pill tone={p.status === "available" ? "ok" : p.status === "flying" ? "info" : "mut"} icon="ph-user">{p.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

// ── Reports / Notifications / Settings ────────────────────────────────────────
function ReportsView({ flights, requests }: { flights: any[]; requests: any[] }) {
  const legs = flights.reduce((s, f) => s + f.legCount, 0);
  const acked = flights.reduce((s, f) => s + f.ackCount, 0);
  const rate = legs ? Math.round((acked / legs) * 100) : 0;
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Reports</h1><p className="page-subtitle">Circuit performance</p></div></div>
      <div className="stats">
        <Stat icon="ph-check-circle" tone="green" label="Ack rate" value={`${rate}%`} />
        <Stat icon="ph-airplane" tone="blue" label="Flights" value={flights.length} />
        <Stat icon="ph-tray-arrow-down" tone="amber" label="Open requests" value={requests.length} />
        <Stat icon="ph-warning" tone="red" label="Escalated flights" value={flights.filter((f) => f.escalated).length} />
      </div>
    </>
  );
}

function NotificationsView({ notifs }: { notifs: any[] }) {
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Notifications</h1><p className="page-subtitle">Escalations dispatched to lodges + ops</p></div></div>
      <Panel title="Notification log">
        {notifs.length === 0 ? (
          <EmptyState icon="ph-bell-slash">No notifications.</EmptyState>
        ) : (
          <div className="feed">
            {notifs.map((n: any) => (
              <div className="fitem" key={n._id}>
                <div className="fi" style={{ background: "var(--risk-bg)", color: "var(--risk-fg)" }}><i className="ph ph-warning" /></div>
                <div className="ft">{n.body}<div className="tm">{fmt.hhmm(n.at)} · {n.channel} · {n.delivered ? "delivered" : "logged (mock)"} · to {n.toPhone ?? "—"}</div></div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function SettingsView({ me }: { me: Me }) {
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">Organization & account</p></div></div>
      <Panel title="Organization">
        <div className="setrow"><div><div className="setk">Airline</div><div className="setv">{me.org.name}</div></div></div>
        <div className="setrow"><div><div className="setk">Your role</div><div className="setv">{me.role}</div></div></div>
        <div className="setrow"><div><div className="setk">Tenant isolation</div><div className="setv">Enforced in code — you only see {me.org.name}’s flights and movements.</div></div></div>
      </Panel>
    </>
  );
}
