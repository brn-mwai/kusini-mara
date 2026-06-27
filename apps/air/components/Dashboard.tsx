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
  useToast,
  fmt,
  type NavSection,
  type CmdItem,
  type PillTone,
} from "@kusini/ui";

type Me = {
  userId: Id<"users">;
  name: string;
  role: string;
  org: { id: Id<"organizations">; name: string; type: "airline" | "lodge"; shortCode: string };
};

const NAV: NavSection[] = [
  {
    sec: "Operations",
    items: [
      { key: "flights", label: "Flights", icon: "ph-airplane-in-flight" },
      { key: "requests", label: "Requests", icon: "ph-tray-arrow-down" },
    ],
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
  flights: "Flights",
  requests: "Requests",
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

export function Dashboard({ me }: { me: Me }) {
  const [view, setView] = useState("flights");
  const flights = useQuery(api.flights.board, {}) ?? [];
  const requests = useQuery(api.flights.requests, {}) ?? [];
  const notifs = useQuery(api.notifications.list, {}) ?? [];

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
      appName="Kusini Air"
      shortCode={me.org.shortCode}
      navSections={NAV.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.key === "requests" && requests.length ? { ...i, badge: requests.length } : i,
        ),
      }))}
      recents={[
        { code: "5Y-BMF", label: "in flight" },
        { code: "5Y-CAC", label: "planned" },
      ]}
      activePage={view}
      crumbPage={TITLES[view] ?? "Flights"}
      onNavigate={setView}
      user={{ name: me.name, sub: `${me.role} · ${me.org.name}`, initials: fmt.initials(me.name) }}
      pilot={{ icon: "ph-airplane-tilt", label: "Fleet today", fill: 60, meta: `${flights.filter((f: any) => f.status === "in_flight").length} flying` }}
      bellBadge={escalated + requests.length || undefined}
      paletteItems={paletteItems}
    >
      {view === "flights" && <FlightsView flights={flights} />}
      {view === "requests" && <RequestsView requests={requests} flights={flights} />}
      {view === "aircraft" && <AircraftView />}
      {view === "pilots" && <PilotsView />}
      {view === "reports" && <ReportsView flights={flights} requests={requests} />}
      {view === "notifications" && <NotificationsView notifs={notifs} />}
      {view === "settings" && <SettingsView me={me} />}
    </Shell>
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
        <Stat icon="ph-bell-ringing" tone="amber" label="Awaiting lodge ack" value={awaiting} sub={`${escal} with escalation`} />
        <Stat icon="ph-warning" tone="red" label="Escalated" value={escal} />
      </div>

      <Panel title="Flights board" desc="Ack counts tick up the instant a lodge acknowledges">
        {flights.length === 0 ? (
          <EmptyState icon="ph-airplane">No flights yet — schedule a request.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="flag"></th>
                <th>Flight</th>
                <th>Pilot</th>
                <th>Circuit</th>
                <th>Departs</th>
                <th>Manifest</th>
                <th>Lodge acks</th>
                <th>Status</th>
                <th className="act"></th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => {
                const [tone, icon, label] = flightStatusPill(f.status);
                const ackTone: PillTone = f.escalated ? "risk" : f.ackCount === f.legCount && f.legCount > 0 ? "ok" : "warn";
                const ackIcon = f.escalated ? "ph-warning" : f.ackCount === f.legCount && f.legCount > 0 ? "ph-check" : "ph-bell-ringing";
                const rowCls = f.escalated ? "esc" : f.legCount > f.ackCount ? "attn" : "";
                return (
                  <tr key={f._id} className={rowCls}>
                    <td className="flag"><span /></td>
                    <td>
                      <div className="flt mono">{f.aircraftReg}</div>
                      <div className="reg">{f.code}</div>
                    </td>
                    <td><div className="assign"><span className="av">{fmt.initials(f.pilotName)}</span>{f.pilotName}</div></td>
                    <td>
                      <div className="route" style={{ flexWrap: "wrap" }}>
                        {f.circuit.length ? (
                          f.circuit.map((s: string, i: number) => (
                            <span key={s}>
                              {i > 0 && <span className="ar"> → </span>}
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="reg">no legs yet</span>
                        )}
                      </div>
                    </td>
                    <td><div className="eta mono">{fmt.hhmm(f.departTime)}</div><div className="cd">{f.base} base</div></td>
                    <td>
                      {f.legCount ? (
                        <>
                          <div className="flt">{f.legCount} guests · {f.pax} pax</div>
                          <div className="reg">{f.mixed && <span className="tag">in + out</span>}{f.pax} / {f.seats} seats</div>
                        </>
                      ) : (
                        <span className="reg">empty</span>
                      )}
                    </td>
                    <td>
                      {f.legCount ? (
                        <Pill tone={ackTone} icon={ackIcon}>{f.ackCount} / {f.legCount} acked</Pill>
                      ) : (
                        <span className="reg">—</span>
                      )}
                    </td>
                    <td><Pill tone={tone} icon={icon}>{label}</Pill></td>
                    <td className="act">
                      <Btn icon="ph-list-bullets" onClick={() => setManifestFor(f)}>Manifest</Btn>{" "}
                      {f.status === "planned" && (
                        <button className="ackbtn" onClick={async () => { await dispatch({ flightId: f._id }); toast(`${f.aircraftReg} dispatched`, "ph-airplane-takeoff"); }}>
                          <i className="ph ph-airplane-takeoff" />Dispatch
                        </button>
                      )}
                      {f.status === "in_flight" && (
                        <Btn icon="ph-flag-checkered" onClick={async () => { await land({ flightId: f._id }); toast(`${f.aircraftReg} landed`, "ph-flag-checkered"); }}>Land</Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {manifestFor && <ManifestModal flight={manifestFor} onClose={() => setManifestFor(null)} />}
    </>
  );
}

function ManifestModal({ flight, onClose }: { flight: any; onClose: () => void }) {
  const legs = [...flight.legs].sort((a: any, b: any) => a.scheduledTime - b.scheduledTime);
  return (
    <Modal title={`Manifest · ${flight.aircraftReg} (${flight.code})`} onClose={onClose}
      footer={<Btn variant="primary" onClick={onClose}>Close</Btn>}>
      {legs.length === 0 ? (
        <EmptyState icon="ph-users">No legs on this flight.</EmptyState>
      ) : (
        <table>
          <thead><tr><th>Guest</th><th>Leg</th><th>Airstrip</th><th>Pax</th><th>Status</th></tr></thead>
          <tbody>
            {legs.map((m: any) => (
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
                <td>
                  <Pill tone={m.status === "acknowledged" || m.status === "in_flight" ? "ok" : m.status === "escalated" ? "risk" : "warn"}
                    icon={m.status === "acknowledged" || m.status === "in_flight" ? "ph-check" : m.status === "escalated" ? "ph-warning" : "ph-bell-ringing"}>
                    {m.status}
                  </Pill>
                </td>
              </tr>
            ))}
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
      <Panel title="Awaiting flight" desc="Each becomes a confirmed transfer on the lodge board the moment you schedule it">
        {requests.length === 0 ? (
          <EmptyState icon="ph-tray">Queue is clear.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr><th>Guest</th><th>Lodge</th><th>Leg</th><th>Airstrip</th><th>Pax</th><th>Wanted</th><th className="act"></th></tr>
            </thead>
            <tbody>
              {requests.map((m: any) => (
                <tr key={m._id} className="attn">
                  <td className="flt">{m.guestName}</td>
                  <td>{m.lodgeName}</td>
                  <td>
                    <span className="route">
                      <i className={`ph ${m.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} />
                      {m.direction}
                    </span>
                  </td>
                  <td>{m.airstrip}</td>
                  <td>{m.pax}</td>
                  <td className="mono">{fmt.hhmm(m.scheduledTime)}</td>
                  <td className="act">
                    <button className="ackbtn" onClick={() => setScheduleFor(m)}>
                      <i className="ph ph-calendar-plus" />Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {scheduleFor && (
        <ScheduleModal movement={scheduleFor} flights={flights} onClose={() => setScheduleFor(null)} />
      )}
    </>
  );
}

function ScheduleModal({ movement, flights, onClose }: { movement: any; flights: any[]; onClose: () => void }) {
  const schedule = useMutation(api.flights.scheduleMovement);
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
      await schedule({ movementId: movement._id, flightId: fid });
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
          <select value={flightId} onChange={(e) => setFlightId(e.target.value)}>
            {openFlights.map((f) => (
              <option key={f._id} value={f._id}>{f.aircraftReg} · {f.code} · {fmt.hhmm(f.departTime)} ({f.legCount} legs)</option>
            ))}
          </select>
        </Field>
      ) : (
        <>
          <Field label="Flight code"><input value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <Field label="Aircraft">
            <select value={reg} onChange={(e) => setReg(e.target.value)}>
              {aircraft.map((a: any) => <option key={a._id} value={a.reg}>{a.reg} — {a.type} ({a.seats} seats)</option>)}
            </select>
          </Field>
          <Field label="Pilot">
            <select value={pilot} onChange={(e) => setPilot(e.target.value)}>
              {pilots.map((p: any) => <option key={p._id} value={p.name}>{p.name} — {p.license}</option>)}
            </select>
          </Field>
          <Field label="Departure (HH:MM)">
            <div style={{ display: "flex", gap: 8 }}>
              <input value={hh} onChange={(e) => setHh(e.target.value)} style={{ width: 70 }} />
              <input value={mm} onChange={(e) => setMm(e.target.value)} style={{ width: 70 }} />
            </div>
          </Field>
        </>
      )}
      <p className="reg" style={{ marginTop: 8 }}>
        {movement.lodgeName} · {movement.airstrip} · {movement.pax} pax
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
        <Stat icon="ph-check-circle" tone="green" label="Lodge ack rate" value={`${rate}%`} />
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
