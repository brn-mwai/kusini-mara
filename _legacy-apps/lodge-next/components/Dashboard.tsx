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
      { key: "today", label: "Today", icon: "ph-house" },
      { key: "arrivals", label: "Arrivals", icon: "ph-airplane-landing" },
      { key: "departures", label: "Departures", icon: "ph-airplane-takeoff" },
    ],
  },
  {
    sec: "Workforce",
    items: [
      { key: "duties", label: "Duties", icon: "ph-clipboard-text" },
      { key: "leave", label: "Leave planner", icon: "ph-calendar-dots" },
      { key: "staff", label: "Staff", icon: "ph-users-three" },
    ],
  },
  {
    sec: "Property",
    items: [{ key: "rooms", label: "Rooms", icon: "ph-bed" }],
  },
  { sec: "Insights", items: [{ key: "reports", label: "Reports", icon: "ph-chart-bar" }] },
];

const TITLES: Record<string, string> = {
  today: "Today",
  arrivals: "Arrivals",
  departures: "Departures",
  duties: "Duties",
  leave: "Leave planner",
  staff: "Staff",
  rooms: "Rooms",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
};

const MODES = [
  { key: "charter", label: "Charter", icon: "ph-airplane-tilt" },
  { key: "scheduled", label: "Scheduled", icon: "ph-airplane-in-flight" },
  { key: "helicopter", label: "Helicopter", icon: "ph-fan" },
  { key: "road", label: "Road transfer", icon: "ph-van" },
  { key: "self_drive", label: "Self-drive", icon: "ph-car" },
  { key: "self_fly", label: "Self-fly", icon: "ph-airplane-takeoff" },
] as const;
const modeMeta = (m: string) => MODES.find((x) => x.key === m) ?? MODES[0];

function arrivalStatus(a: any): [PillTone, string, string] {
  switch (a.status) {
    case "requested": return ["mut", "ph-clock-countdown", "Awaiting transport"];
    case "completed": case "arrived": return ["mut", "ph-check", "Completed"];
    case "in_transit": return ["info", "ph-airplane-in-flight", "In transit"];
    case "escalated": return ["risk", "ph-warning", "Escalated"];
    case "cancelled": return ["mut", "ph-x", "Cancelled"];
    case "no_show": return ["risk", "ph-user-minus", "No-show"];
    case "acknowledged":
      return a.reconfirmRequested ? ["warn", "ph-arrows-clockwise", "Reconfirm"] : ["ok", "ph-check", "Confirmed"];
    case "scheduled":
      return a.reconfirmRequested ? ["warn", "ph-arrows-clockwise", "Reconfirm"] : ["warn", "ph-bell-ringing", "Awaiting ack"];
    default: return ["mut", "ph-question", a.status];
  }
}
const canAck = (a: any) => a.status === "scheduled" || a.status === "escalated";

function transportRef(a: any): string {
  const d = a.modeDetail ?? {};
  if (a.mode === "charter") return a.flight?.reg ? `${a.flight.reg} · ${a.flight.code}` : "awaiting flight";
  if (a.mode === "scheduled") return [d.carrier, d.flightNumber].filter(Boolean).join(" ") || "scheduled flight";
  if (a.mode === "road") return [d.operator, d.vehicle].filter(Boolean).join(" · ") || "road transfer";
  if (a.mode === "self_drive") return d.guestVehicle || "guest vehicle";
  if (a.mode === "helicopter") return d.operator || "helicopter";
  if (a.mode === "self_fly") return d.aircraftReg || "private aircraft";
  return "";
}

export function Dashboard({ me }: { me: Me }) {
  const [view, setView] = useState("today");
  const board = useQuery(api.arrivals.board, {}) ?? [];
  const notifs = useQuery(api.notifications.list, { app: "lodge" }) ?? [];

  const today = board.filter((a: any) => fmt.isToday(a.scheduledTime));
  const needAck = today.filter((a: any) => canAck(a)).length;
  const escal = board.filter((a: any) => a.status === "escalated").length;

  const paletteItems: CmdItem[] = useMemo(() => {
    const nav: CmdItem[] = Object.keys(TITLES).map((k) => ({
      id: "nav-" + k, label: TITLES[k] ?? k,
      icon: NAV.flatMap((s) => s.items).find((i) => i.key === k)?.icon ?? "ph-arrow-right",
      section: "Navigate", run: () => setView(k),
    }));
    const arr: CmdItem[] = board.map((a: any) => ({
      id: "a-" + a._id, label: `${a.guestName} · ${modeMeta(a.mode).label} · ${a.destinationLabel}`,
      icon: modeMeta(a.mode).icon, section: "Arrivals", sub: transportRef(a),
      run: () => setView(a.direction === "arrival" ? "arrivals" : "departures"),
    }));
    return [...nav, ...arr];
  }, [board]);

  return (
    <Shell
      appName="Kusini Lodge"
      shortCode={me.org.shortCode}
      navSections={NAV.map((s) => ({ ...s, items: s.items.map((i) => i.key === "today" && needAck ? { ...i, badge: needAck } : i) }))}
      recents={[{ code: "5Y-BMF", label: "Ol Kiombo" }, { code: "5Y-CAC", label: "Keekorok" }]}
      activePage={view}
      crumbPage={TITLES[view] ?? "Today"}
      onNavigate={setView}
      user={{ name: me.name, sub: `${me.role} · ${me.org.name}`, initials: fmt.initials(me.name) }}
      pilot={{ icon: "ph-flag-banner", label: "Pilot progress", fill: 50, meta: "Week 6 of 12 · midpoint review" }}
      bellBadge={escal + needAck || undefined}
      paletteItems={paletteItems}
    >
      {(view === "today" || view === "arrivals" || view === "departures") && (
        <BoardView
          view={view}
          rows={view === "today" ? today : board.filter((a: any) => a.direction === (view === "arrivals" ? "arrival" : "departure"))}
          me={me}
        />
      )}
      {view === "duties" && <DutiesView />}
      {view === "leave" && <LeaveView />}
      {view === "staff" && <StaffView />}
      {view === "rooms" && <RoomsView />}
      {view === "reports" && <ReportsView board={board} />}
      {view === "notifications" && <NotificationsView notifs={notifs} />}
      {view === "settings" && <SettingsView me={me} />}
    </Shell>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────
function BoardView({ view, rows, me }: { view: string; rows: any[]; me: Me }) {
  const acknowledge = useMutation(api.arrivals.acknowledge);
  const toast = useToast();
  const [assignFor, setAssignFor] = useState<any | null>(null);
  const [detailFor, setDetailFor] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const confirmed = rows.filter((a) => a.status === "acknowledged").length;
  const awaiting = rows.filter((a) => canAck(a)).length;
  const escalated = rows.filter((a) => a.status === "escalated").length;

  const onAck = async (a: any) => {
    try { await acknowledge({ arrivalId: a._id }); toast(`Acknowledged ${a.guestName}`, "ph-check-circle"); }
    catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{TITLES[view]}</h1>
          <p className="page-subtitle">{me.org.name} · <span className="clock">{rows.length} arrivals</span></p>
        </div>
        <div className="header-actions">
          <Btn variant="primary" icon="ph-plus" onClick={() => setAddOpen(true)}>Add arrival</Btn>
        </div>
      </div>

      <div className="stats">
        <Stat icon="ph-bell-ringing" tone="amber" label="Awaiting acknowledgment" value={awaiting} sub="confirm to close the loop" />
        <Stat icon="ph-check-circle" tone="green" label="Confirmed" value={confirmed} sub="property acknowledged" />
        <Stat icon="ph-warning" tone="red" label="Escalated" value={escalated} sub="unacknowledged in window" />
        <Stat icon="ph-path" tone="blue" label="Total" value={rows.length} sub="all transport modes" />
      </div>

      <DataTable<any>
        rows={rows}
        noun="arrival"
        getRowKey={(a) => a._id}
        searchText={(a) => `${a.guestName} ${a.destinationLabel} ${a.origin} ${a.mode} ${transportRef(a)}`}
        searchPlaceholder="Search guest, airstrip, mode…"
        rowClassName={(a) => [detailFor?._id === a._id ? "sel" : "", a.status === "escalated" ? "esc" : canAck(a) ? "attn" : ""].filter(Boolean).join(" ")}
        onRowClick={(a) => setDetailFor(a)}
        empty={{ icon: "ph-airplane", title: "No arrivals in this view." }}
        columns={[
          {
            key: "transport", label: "Transport",
            render: (a) => (<><div className="flt"><i className={`ph ${modeMeta(a.mode).icon}`} style={{ marginRight: 6, color: "var(--text-2)" }} />{modeMeta(a.mode).label}</div><div className="reg mono">{transportRef(a)}</div></>),
          },
          {
            key: "route", label: "Route",
            render: (a) => (<div className="route"><i className={`ph ${a.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} /><span>{a.origin} → {a.destinationLabel}</span></div>),
          },
          {
            key: "guest", label: "Guest",
            render: (a) => (<><div className="flt">{a.guestName}{a.vip ? <span className="tag" style={{ marginLeft: 6 }}>VIP</span> : null}</div><div className="reg">{a.pax} pax</div></>),
          },
          {
            key: "time", label: "Time",
            render: (a) => { const cd = fmt.countdown(a.scheduledTime); return (<><div className="eta mono">{fmt.hhmm(a.scheduledTime)}</div><div className={`cd ${cd.overdue ? "risk" : ""}`}>{cd.text}</div></>); },
          },
          { key: "status", label: "Status", render: (a) => { const [t, i, l] = arrivalStatus(a); return <Pill tone={t} icon={i}>{l}</Pill>; } },
          {
            key: "ground", label: "Ground",
            render: (a) => a.assigned?.length
              ? (<div className="assign"><span className="av">{fmt.initials(a.assigned[0].name)}</span>{a.assigned[0].name}{a.assigned.length > 1 ? ` +${a.assigned.length - 1}` : ""}</div>)
              : (<span className="reg">unassigned</span>),
          },
          {
            key: "act", label: "", align: "right",
            render: (a) => (
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                {canAck(a) && (<button className="ackbtn" onClick={() => onAck(a)}><i className="ph ph-check" />{a.reconfirmRequested ? "Reconfirm" : "Acknowledge"}</button>)}
                <Btn icon="ph-user-plus" onClick={() => setAssignFor(a)}>Assign</Btn>
              </div>
            ),
          },
        ]}
      />

      {assignFor && <AssignModal arrival={assignFor} onClose={() => setAssignFor(null)} />}
      {addOpen && <AddArrivalModal onClose={() => setAddOpen(false)} />}
      {detailFor && <ArrivalDetailModal arrivalId={detailFor._id} onClose={() => setDetailFor(null)} />}
    </>
  );
}

// ── Arrival detail drawer (everything about one arrival + actions) ────────────
function ArrivalDetailModal({ arrivalId, onClose }: { arrivalId: Id<"arrivalEvents">; onClose: () => void }) {
  const a = useQuery(api.arrivals.get, { arrivalId });
  const acknowledge = useMutation(api.arrivals.acknowledge);
  const cancel = useMutation(api.arrivals.cancel);
  const toast = useToast();
  const [assign, setAssign] = useState(false);
  const [placeRoom, setPlaceRoom] = useState(false);

  if (!a) {
    return <Modal title="Arrival" onClose={onClose} footer={<Btn onClick={onClose}>Close</Btn>}><div className="reg">Loading…</div></Modal>;
  }
  const [tone, icon, label] = arrivalStatus(a);
  const d = a.modeDetail ?? {};
  const detailRows: Array<[string, string]> = [];
  if (a.flight) detailRows.push(["Flight", `${a.flight.reg} · ${a.flight.code} · ${a.flight.pilot}`]);
  if (d.carrier) detailRows.push(["Carrier", `${d.carrier} ${d.flightNumber ?? ""}`]);
  if (d.connectionNotes) detailRows.push(["Connection", d.connectionNotes]);
  if (d.operator) detailRows.push(["Operator", d.operator]);
  if (d.vehicle) detailRows.push(["Vehicle", d.vehicle]);
  if (d.driverName || d.driverContact) detailRows.push(["Driver", `${d.driverName ?? ""} ${d.driverContact ?? ""}`]);
  if (d.guestVehicle) detailRows.push(["Guest vehicle", d.guestVehicle]);
  if (d.landingPoint) detailRows.push(["Landing point", d.landingPoint]);
  if (d.pilotContact) detailRows.push(["Pilot contact", d.pilotContact]);
  if (d.routeNotes) detailRows.push(["Route", d.routeNotes]);

  const onAck = async () => { try { await acknowledge({ arrivalId }); toast("Acknowledged", "ph-check-circle"); } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); } };
  const onCancel = async () => { try { await cancel({ arrivalId }); toast("Arrival cancelled", "ph-x-circle"); onClose(); } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); } };

  return (
    <>
      <Modal
        title={`${a.guestName}`}
        onClose={onClose}
        wide
        footer={
          <>
            <Btn icon="ph-x-circle" onClick={onCancel}>Cancel arrival</Btn>
            <div style={{ flex: 1 }} />
            <Btn icon="ph-bed" onClick={() => setPlaceRoom(true)}>Place in room</Btn>
            <Btn icon="ph-user-plus" onClick={() => setAssign(true)}>Assign ground</Btn>
            {canAck(a) && <Btn variant="primary" icon="ph-check" onClick={onAck}>{a.reconfirmRequested ? "Reconfirm" : "Acknowledge"}</Btn>}
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Pill tone={tone} icon={icon}>{label}</Pill>
          <span className="tag"><i className={`ph ${modeMeta(a.mode).icon}`} style={{ marginRight: 5 }} />{modeMeta(a.mode).label}</span>
          {a.vip && <span className="tag">VIP</span>}
        </div>

        <DetailRow k="Route" v={`${a.origin} → ${a.destinationLabel}`} />
        <DetailRow k="Time" v={`${fmt.hhmm(a.scheduledTime)} · ${new Date(a.scheduledTime).toDateString()}${a.timezone ? ` · ${a.timezone}` : ""}`} />
        <DetailRow k="Party" v={`${a.pax} pax${a.leadGuestNationality ? ` · ${a.leadGuestNationality}` : ""}`} />
        {a.special?.length ? <DetailRow k="Special" v={a.special.join(", ")} /> : null}
        {a.luggage ? <DetailRow k="Luggage" v={a.luggage} /> : null}
        {detailRows.map(([k, v]) => <DetailRow key={k} k={k} v={v} />)}
        {a.room ? <DetailRow k="Room" v={`${a.room.name} · ${String(a.room.type).replace(/_/g, " ")}`} /> : null}

        {a.guests?.length ? (
          <div style={{ marginTop: 12 }}>
            <div className="kpi-head" style={{ padding: "0 0 6px" }}>Guests</div>
            {a.guests.map((g: any) => (<div key={g._id} className="reg" style={{ padding: "2px 0" }}>· {g.fullName}{g.type === "child" ? " (child)" : ""}{g.nationality ? ` — ${g.nationality}` : ""}</div>))}
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <div className="kpi-head" style={{ padding: "0 0 6px" }}>Ground assignments</div>
          {a.duties?.length ? a.duties.map((du: any) => (
            <div key={du.id} className="reg" style={{ padding: "2px 0" }}>· {du.staff}{du.vehicle ? ` — ${du.vehicle}` : ""} ({String(du.dutyType).replace(/_/g, " ")}) · {du.status}</div>
          )) : <div className="reg">None yet.</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="kpi-head" style={{ padding: "0 0 6px" }}>Timeline</div>
          <div className="feed" style={{ padding: 0 }}>
            {a.events?.slice().reverse().map((e: any) => (
              <div className="fitem" key={e._id} style={{ padding: "7px 0" }}>
                <div className="fi" style={{ background: "var(--mut-bg)", color: "var(--text-2)" }}><i className="ph ph-circle" /></div>
                <div className="ft">{e.summary}<div className="tm">{fmt.hhmm(e.at)} · {String(e.type).replace(/_/g, " ")}</div></div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      {assign && <AssignModal arrival={a} onClose={() => setAssign(false)} />}
      {placeRoom && <RoomPlaceModal arrival={a} onClose={() => setPlaceRoom(false)} />}
    </>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="setrow" style={{ padding: "8px 0" }}>
      <div className="setk" style={{ minWidth: 110, color: "var(--text-3)", fontWeight: 500 }}>{k}</div>
      <div className="setv" style={{ marginTop: 0, textAlign: "right" }}>{v}</div>
    </div>
  );
}

function RoomPlaceModal({ arrival, onClose }: { arrival: any; onClose: () => void }) {
  const rooms = useQuery(api.rooms.list, {}) ?? [];
  const place = useMutation(api.rooms.assign);
  const toast = useToast();
  const [roomId, setRoomId] = useState("");
  const submit = async () => {
    if (!roomId) return;
    try { await place({ arrivalId: arrival._id, roomId: roomId as Id<"rooms">, guest: arrival.guestName }); toast("Guest placed", "ph-bed"); onClose(); }
    catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };
  return (
    <Modal title={`Place ${arrival.guestName}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Place</Btn></>}>
      <Field label="Room">
        <Select value={roomId} onChange={setRoomId} placeholder="Select room…"
          options={rooms.map((r: any) => ({ value: r._id, label: `${r.name} — ${String(r.type).replace(/_/g, " ")} (${r.capacity} pax)` }))} />
      </Field>
    </Modal>
  );
}

function AssignModal({ arrival, onClose }: { arrival: any; onClose: () => void }) {
  const staff = useQuery(api.staff.list, {}) ?? [];
  const vehicles = useQuery(api.staff.vehicles, {}) ?? [];
  const assign = useMutation(api.duties.assign);
  const toast = useToast();
  const [staffId, setStaffId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const vehicle = vehicles.find((v: any) => v._id === vehicleId);
  const capacityShort = vehicle && vehicle.seats < arrival.pax;

  const submit = async () => {
    if (!staffId) return;
    try {
      await assign({
        arrivalId: arrival._id, staffId: staffId as Id<"staff">,
        vehicleId: vehicleId ? (vehicleId as Id<"vehicles">) : undefined,
        seatsCovered: vehicle?.seats,
      });
      toast(`Assigned to ${arrival.guestName}`, "ph-user-check");
      onClose();
    } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <Modal title={`Assign ground · ${arrival.guestName}`} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Assign</Btn></>}>
      <Field label="Staff member">
        <Select value={staffId} onChange={setStaffId} placeholder="Select staff…"
          options={staff.map((s: any) => ({ value: s._id, label: `${s.name} — ${String(s.role).replace(/_/g, " ")}` }))} />
      </Field>
      <Field label="Vehicle (optional)">
        <Select value={vehicleId} onChange={setVehicleId} placeholder="None"
          options={[{ value: "", label: "None" }, ...vehicles.map((v: any) => ({ value: v._id, label: `${v.name} — ${v.seats} seats` }))]} />
      </Field>
      <p className="reg" style={{ marginTop: 4 }}>
        {arrival.pax} pax · {arrival.direction === "arrival" ? "pickup" : "drop-off"} at {arrival.destinationLabel}
      </p>
      {capacityShort && (
        <div className="banner" style={{ color: "var(--risk-fg)", background: "var(--risk-bg)", marginTop: 10 }}>
          <i className="ph ph-warning" /> {arrival.pax} guests, {vehicle.name} seats {vehicle.seats} — add a second vehicle.
        </div>
      )}
    </Modal>
  );
}

function AddArrivalModal({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.arrivals.create);
  const toast = useToast();
  const [mode, setMode] = useState("charter");
  const [dir, setDir] = useState<"arrival" | "departure">("arrival");
  const [guest, setGuest] = useState("");
  const [pax, setPax] = useState(2);
  const [origin, setOrigin] = useState("Wilson");
  const [dest, setDest] = useState("Ol Kiombo");
  const [hh, setHh] = useState("14");
  const [mm, setMm] = useState("00");
  const strips = ["Ol Kiombo", "Keekorok", "Musiara", "Mara North", "Main gate", "Helipad"];

  const submit = async () => {
    if (!guest) { toast("Enter a guest name", "ph-warning"); return; }
    const t = new Date(); t.setHours(Number(hh), Number(mm), 0, 0);
    const airMode = ["charter", "scheduled", "helicopter", "self_fly"].includes(mode);
    try {
      await create({
        mode: mode as any, direction: dir, origin, destinationLabel: dest,
        guestName: guest, pax, scheduledTime: t.getTime(),
        airstripName: airMode ? dest : undefined,
      });
      toast("Arrival added", "ph-calendar-check");
      onClose();
    } catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  return (
    <Modal title="Add arrival" onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" icon="ph-check" onClick={submit}>Create</Btn></>}>
      <Field label="Transport mode">
        <Select value={mode} onChange={setMode} options={MODES.map((m) => ({ value: m.key, label: m.label }))} />
      </Field>
      <Field label="Direction">
        <Select value={dir} onChange={(v) => setDir(v as any)} options={[{ value: "arrival", label: "Arrival" }, { value: "departure", label: "Departure" }]} />
      </Field>
      <Field label="Guest / party"><input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Okafor" /></Field>
      <Field label="Pax"><input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} /></Field>
      <Field label="Origin"><input value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
      <Field label="Destination (airstrip / gate)">
        <Select value={dest} onChange={setDest} options={strips.map((s) => ({ value: s, label: s }))} />
      </Field>
      <Field label="Time">
        <TimeField hour={hh} minute={mm} onChange={(h, m) => { setHh(h); setMm(m); }} />
      </Field>
      <p className="reg" style={{ marginTop: 4 }}>Charter arrivals go to the airline’s queue to be put on a flight. Other modes are confirmed directly.</p>
    </Modal>
  );
}

// ── Duties ────────────────────────────────────────────────────────────────────
function DutiesView() {
  const duties = useQuery(api.duties.list, {}) ?? [];
  const confirm = useMutation(api.duties.confirm);
  const remove = useMutation(api.duties.remove);
  const toast = useToast();
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Duties</h1><p className="page-subtitle">Ground assignments across today’s arrivals</p></div></div>
      <DataTable<any>
        rows={duties} noun="duty" getRowKey={(d) => d._id}
        searchText={(d) => `${d.staffName} ${d.guestName} ${d.airstrip}`}
        empty={{ icon: "ph-clipboard", title: "No duties assigned yet." }}
        columns={[
          { key: "staff", label: "Staff", render: (d) => (<div className="assign"><span className="av">{fmt.initials(d.staffName)}</span>{d.staffName}</div>) },
          { key: "guest", label: "Guest", render: (d) => <span className="flt">{d.guestName}</span> },
          { key: "type", label: "Duty", render: (d) => <span className="tag">{String(d.dutyType).replace(/_/g, " ")}</span> },
          { key: "vehicle", label: "Vehicle", render: (d) => d.vehicleName ?? <span className="reg">—</span> },
          { key: "time", label: "Time", align: "right", render: (d) => <span className="mono">{d.scheduledTime ? fmt.hhmm(d.scheduledTime) : "—"}</span> },
          { key: "status", label: "Status", render: (d) => <Pill tone={d.status === "accepted" || d.status === "completed" ? "ok" : "info"} icon="ph-user-check">{d.status}</Pill> },
          {
            key: "act", label: "", align: "right",
            render: (d) => (
              <div className="row-actions">
                {d.status === "assigned" && <Btn icon="ph-check" onClick={async () => { await confirm({ dutyId: d._id }); toast("Duty confirmed", "ph-check"); }}>Confirm</Btn>}
                <Btn icon="ph-trash" onClick={async () => { await remove({ dutyId: d._id }); toast("Duty removed", "ph-trash"); }}>Remove</Btn>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

// ── Staff ─────────────────────────────────────────────────────────────────────
function StaffView() {
  const staff = useQuery(api.staff.list, {}) ?? [];
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Staff</h1><p className="page-subtitle">Property workforce register</p></div></div>
      <DataTable<any>
        rows={staff} noun="staff member" getRowKey={(s) => s._id}
        searchText={(s) => `${s.name} ${s.role}`}
        empty={{ icon: "ph-users", title: "No staff on record." }}
        columns={[
          { key: "name", label: "Name", render: (s) => <span className="flt">{s.name}</span> },
          { key: "role", label: "Role", render: (s) => String(s.role).replace(/_/g, " ") },
          { key: "phone", label: "Phone", render: (s) => <span className="mono">{s.phoneE164 ?? "—"}</span> },
          { key: "lang", label: "Languages", render: (s) => s.languages.map((l: string) => <span className="tag" key={l}>{l}</span>) },
          { key: "leave", label: "Leave left", align: "right", render: (s) => <span className="mono">{s.remaining}/{s.allowedDays}</span> },
        ]}
      />
    </>
  );
}

// ── Rooms ─────────────────────────────────────────────────────────────────────
function RoomsView() {
  const rooms = useQuery(api.rooms.list, {}) ?? [];
  const assignments = useQuery(api.rooms.assignments, {}) ?? [];
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Rooms</h1><p className="page-subtitle">Inventory and guest placement for arrival prep</p></div></div>
      <DataTable<any>
        rows={rooms} noun="room" getRowKey={(r) => r._id}
        searchText={(r) => `${r.name} ${r.type}`}
        empty={{ icon: "ph-bed", title: "No rooms defined." }}
        columns={[
          { key: "name", label: "Room", render: (r) => <span className="flt">{r.name}</span> },
          { key: "type", label: "Type", render: (r) => String(r.type).replace(/_/g, " ") },
          { key: "cap", label: "Capacity", align: "right", render: (r) => <span className="mono">{r.capacity}</span> },
          { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "available" ? "ok" : "mut"} icon="ph-circle">{r.status ?? "available"}</Pill> },
        ]}
      />
      {assignments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Panel title="Guest placements">
            {assignments.map((a: any) => (
              <div className="roster" key={a._id}>
                <div className="who"><span className="av">{fmt.initials(a.guestName)}</span><div><div className="flt">{a.guestName}</div><div className="reg">{a.roomName} · {String(a.roomType).replace(/_/g, " ")}</div></div></div>
              </div>
            ))}
          </Panel>
        </div>
      )}
    </>
  );
}

// ── Leave planner (month calendar + per-day availability) ─────────────────────
const DAY_MS = 86400000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MIN_COVERAGE = 3;
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function LeaveView() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<number>(today.getTime());

  const { gridStart, monthIndex, monthLabel } = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const gs = new Date(first); gs.setDate(1 - first.getDay()); gs.setHours(0, 0, 0, 0);
    return { gridStart: gs.getTime(), monthIndex: first.getMonth(), monthLabel: first.toLocaleString(undefined, { month: "long", year: "numeric" }) };
  }, [today, monthOffset]);

  const data = useQuery(api.leave.grid, { startDate: gridStart, days: 42, minCoverage: MIN_COVERAGE });
  const toggle = useMutation(api.leave.toggle);
  const toast = useToast();

  const goMonth = (delta: number) => {
    const next = monthOffset + delta;
    const first = new Date(today.getFullYear(), today.getMonth() + next, 1);
    setMonthOffset(next); setSelected(startOfDay(first).getTime());
  };
  const onToggle = async (staffId: Id<"staff">) => {
    try { const r = await toggle({ staffId, date: selected }); toast(r.onLeave ? "Marked on leave" : "Leave cleared", "ph-calendar-dots"); }
    catch (e: any) { toast(e.message ?? "Failed", "ph-warning"); }
  };

  const selIdx = Math.round((selected - gridStart) / DAY_MS);
  const rows: any[] = data?.rows ?? [];
  const available = rows.filter((r) => !r.leave.includes(selIdx));
  const onLeave = rows.filter((r) => r.leave.includes(selIdx));

  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Leave planner</h1><p className="page-subtitle">{data ? `${data.staffCount} staff` : "Loading…"} · pick a day to see who’s available</p></div></div>
      <div className="cal-bar">
        <div className="cal-title">{monthLabel}</div>
        <div className="cal-nav">
          <Btn icon="ph-caret-left" onClick={() => goMonth(-1)}>Prev</Btn>
          <Btn onClick={() => { setMonthOffset(0); setSelected(today.getTime()); }}>Today</Btn>
          <Btn icon="ph-caret-right" onClick={() => goMonth(1)}>Next</Btn>
        </div>
      </div>
      <div className="cal">
        <div className="cal-head">{WEEKDAYS.map((w) => <div key={w}>{w}</div>)}</div>
        <div className="cal-grid">
          {Array.from({ length: 42 }, (_, i) => {
            const ms = gridStart + i * DAY_MS; const date = new Date(ms);
            const inMonth = date.getMonth() === monthIndex; const isToday = ms === today.getTime(); const isSel = ms === selected;
            const cov = data?.coverage?.[i];
            const cls = ["cal-cell", inMonth ? "" : "out", isToday ? "today" : "", isSel ? "sel" : "", cov?.short ? "short" : ""].filter(Boolean).join(" ");
            return (
              <div key={i} className={cls} onClick={() => setSelected(ms)}>
                <div className="cal-date">{date.getDate()}</div>
                {data && cov ? <div className="cal-avail"><span className="cal-dot" />{cov.available} avail</div> : null}
              </div>
            );
          })}
        </div>
      </div>
      <Panel title={new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} desc={`${available.length} available · ${onLeave.length} on leave · minimum ${MIN_COVERAGE}`}>
        {available.length < MIN_COVERAGE && (<div className="banner" style={{ color: "var(--risk-fg)", background: "var(--risk-bg)" }}><i className="ph ph-warning" /> Below minimum coverage for this day</div>)}
        {rows.length === 0 ? <EmptyState icon="ph-users">No staff on record.</EmptyState> : (
          <>
            {available.map((r) => (
              <div className="roster" key={r.id}>
                <div className="who"><span className="av">{fmt.initials(r.name)}</span><div><div className="flt">{r.name}</div><div className="reg">{String(r.role).replace(/_/g, " ")} · {r.remaining}/{r.allowedDays} days left</div></div></div>
                <div className="row-actions"><Pill tone="ok" icon="ph-check">Available</Pill><Btn icon="ph-airplane-takeoff" onClick={() => onToggle(r.id)}>Mark leave</Btn></div>
              </div>
            ))}
            {onLeave.map((r) => (
              <div className="roster" key={r.id}>
                <div className="who"><span className="av">{fmt.initials(r.name)}</span><div><div className="flt">{r.name}</div><div className="reg">{String(r.role).replace(/_/g, " ")} · {r.remaining}/{r.allowedDays} days left</div></div></div>
                <div className="row-actions"><Pill tone="warn" icon="ph-airplane-takeoff">On leave</Pill><Btn icon="ph-arrow-counter-clockwise" onClick={() => onToggle(r.id)}>Clear</Btn></div>
              </div>
            ))}
          </>
        )}
      </Panel>
    </>
  );
}

// ── Reports / Notifications / Settings ────────────────────────────────────────
function ReportsView({ board }: { board: any[] }) {
  const total = board.length;
  const acked = board.filter((a) => a.status === "acknowledged" || a.status === "completed").length;
  const esc = board.filter((a) => a.status === "escalated").length;
  const rate = total ? Math.round((acked / total) * 100) : 0;
  const byMode = MODES.map((m) => ({ ...m, n: board.filter((a) => a.mode === m.key).length })).filter((m) => m.n);
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Reports</h1><p className="page-subtitle">Acknowledgment performance</p></div></div>
      <div className="stats">
        <Stat icon="ph-check-circle" tone="green" label="Acknowledgment rate" value={`${rate}%`} />
        <Stat icon="ph-path" tone="blue" label="Arrivals" value={total} />
        <Stat icon="ph-warning" tone="red" label="Escalations" value={esc} />
        <Stat icon="ph-clock" tone="amber" label="Open" value={board.filter((a) => canAck(a)).length} />
      </div>
      <Panel title="By transport mode">
        {byMode.map((m) => (
          <div className="setrow" key={m.key}><div className="setk"><i className={`ph ${m.icon}`} style={{ marginRight: 8, color: "var(--text-2)" }} />{m.label}</div><div className="mono">{m.n}</div></div>
        ))}
      </Panel>
    </>
  );
}

function NotificationsView({ notifs }: { notifs: any[] }) {
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Notifications</h1><p className="page-subtitle">Escalations and nudges — SMS backbone</p></div></div>
      <Panel title="Notification log">
        {notifs.length === 0 ? <EmptyState icon="ph-bell-slash">No notifications.</EmptyState> : (
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
  const s = useQuery(api.settings.get, {});
  return (
    <>
      <div className="page-header-row"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">Property configuration</p></div></div>
      {!s ? <Panel title="Loading…"><div className="reg" style={{ padding: 16 }}>Loading…</div></Panel> : (
        <>
          <div className="stats">
            <Stat icon="ph-users-three" tone="blue" label="Staff" value={s.counts.staff} />
            <Stat icon="ph-van" tone="green" label="Vehicles" value={s.counts.vehicles} />
            <Stat icon="ph-bed" tone="amber" label="Rooms" value={s.counts.rooms} />
            <Stat icon="ph-path" tone="red" label="Arrivals on record" value={s.counts.arrivals} />
          </div>
          <Panel title="Property">
            <div className="setrow"><div><div className="setk">Operator</div><div className="setv">{s.operator?.name} ({s.operator?.shortCode})</div></div></div>
            <div className="setrow"><div><div className="setk">Property</div><div className="setv">{s.property.name} · {s.property.region}</div></div></div>
            <div className="setrow"><div><div className="setk">Timezone</div><div className="setv mono">{s.property.timezone}</div></div></div>
            <div className="setrow"><div><div className="setk">Leave carry-over</div><div className="setv">{String(s.property.carryOverPolicy).replace(/_/g, " ")}{s.property.carryOverCapDays ? ` · up to ${s.property.carryOverCapDays} days` : ""}</div></div></div>
          </Panel>
          <Panel title="Contacts">
            {s.dutyContact && <div className="setrow"><div><div className="setk">Duty contact</div><div className="setv">{s.dutyContact.name} · <span className="mono">{s.dutyContact.phone}</span></div></div></div>}
            {s.backupContact && <div className="setrow"><div><div className="setk">Backup contact</div><div className="setv">{s.backupContact.name} · <span className="mono">{s.backupContact.phone}</span></div></div></div>}
          </Panel>
          <Panel title="Coverage rules" desc="Minimum staff per role — drives leave coverage warnings">
            {s.coverage.map((c: any) => (
              <div className="setrow" key={c.role}><div><div className="setk">{String(c.role).replace(/_/g, " ")}</div></div><div className="mono">min {c.minStaff} · peak {c.peakMinStaff}</div></div>
            ))}
          </Panel>
        </>
      )}
    </>
  );
}
