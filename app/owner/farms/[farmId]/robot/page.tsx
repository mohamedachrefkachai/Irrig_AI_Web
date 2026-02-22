"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

type RobotState = "Online" | "Offline" | "Busy" | "Charging";
type RobotHealth = "OK" | "Warning" | "Critical";

type MissionType = "TREE" | "ZONE";
type MissionAction = "IRRIGATE" | "SPRAY" | "INSPECT";
type MissionStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED" | "CANCELLED";

type Mission = {
  id: string;
  type: MissionType;
  action: MissionAction;
  targetId: string;
  targetLabel: string;
  durationMin?: number;
  createdAt: string;
  status: MissionStatus;
  notes?: string;
};

type Robot = {
  name: string;
  state: RobotState;
  health: RobotHealth;
  battery: number;
  lastSync: string;
  currentMissionId?: string;
  lastTreeSeen?: string;
  lastZone?: string;
  camera: "OK" | "Fail";
  motors: "OK" | "Fail";
  comms: "OK" | "Fail";
};

function nowLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Today ${hh}:${mm}`;
}

function shortId() {
  return Math.random().toString(16).slice(2, 8);
}

function statusChipClass(s: MissionStatus) {
  if (s === "DONE") return "bg-green-100 text-green-800";
  if (s === "RUNNING") return "bg-blue-100 text-blue-800";
  if (s === "FAILED") return "bg-red-100 text-red-800";
  if (s === "CANCELLED") return "bg-gray-100 text-gray-800";
  return "bg-orange-100 text-orange-800";
}

function healthChipClass(h: RobotHealth) {
  if (h === "OK") return "bg-green-100 text-green-800";
  if (h === "Warning") return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function stateChipClass(s: RobotState) {
  if (s === "Online") return "bg-green-100 text-green-800";
  if (s === "Busy") return "bg-blue-100 text-blue-800";
  if (s === "Charging") return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

export default function RobotPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const [robot, setRobot] = useState<Robot>({
    name: "Irrig'Ai Rover 01",
    state: "Online",
    health: "OK",
    battery: 78,
    lastSync: nowLabel(),
    lastTreeSeen: "R1-T2",
    lastZone: "Zone A",
    camera: "OK",
    motors: "OK",
    comms: "OK",
  });

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "m_" + shortId(),
      type: "TREE",
      action: "INSPECT",
      targetId: "R2-T1",
      targetLabel: "Tree R2-T1",
      createdAt: "Today 09:25",
      status: "PENDING",
      notes: "Capture photo for anomaly review.",
    },
    {
      id: "m_" + shortId(),
      type: "ZONE",
      action: "IRRIGATE",
      targetId: "zone-a",
      targetLabel: "Zone A - Oliviers Est",
      durationMin: 10,
      createdAt: "Today 09:10",
      status: "DONE",
    },
  ]);

  const [logs, setLogs] = useState<
    { id: string; time: string; level: "INFO" | "WARN" | "CRIT"; msg: string }[]
  >([
    { id: "l1", time: "Today 09:08", level: "INFO", msg: "Robot connected to Wi-Fi" },
    { id: "l2", time: "Today 09:11", level: "INFO", msg: "Mission executed: IRRIGATE Zone A (10 min)" },
    { id: "l3", time: "Today 09:50", level: "WARN", msg: "Low moisture detected near R2-T1 (demo)" },
  ]);

  const kpi = useMemo(() => {
    const pending = missions.filter((m) => m.status === "PENDING").length;
    const running = missions.filter((m) => m.status === "RUNNING").length;
    const done = missions.filter((m) => m.status === "DONE").length;
    const failed = missions.filter((m) => m.status === "FAILED").length;
    return { pending, running, done, failed };
  }, [missions]);

  const currentMission = useMemo(() => {
    const running = missions.find((m) => m.status === "RUNNING");
    return running ?? null;
  }, [missions]);

  function addLog(level: "INFO" | "WARN" | "CRIT", msg: string) {
    setLogs((prev) => [{ id: "l_" + shortId(), time: nowLabel(), level, msg }, ...prev]);
    setRobot((r) => ({ ...r, lastSync: nowLabel() }));
  }

  function simulateStartNextMission() {
    const next = missions.find((m) => m.status === "PENDING");
    if (!next) {
      addLog("INFO", "No pending missions.");
      return;
    }
    setMissions((prev) => prev.map((m) => (m.id === next.id ? { ...m, status: "RUNNING" } : m)));
    setRobot((r) => ({ ...r, state: "Busy", currentMissionId: next.id }));
    addLog("INFO", `Mission started: ${next.action} ${next.targetLabel}`);
  }

  function simulateCompleteMission(success: boolean) {
    const running = missions.find((m) => m.status === "RUNNING");
    if (!running) {
      addLog("INFO", "No running mission.");
      return;
    }
    setMissions((prev) =>
      prev.map((m) => (m.id === running.id ? { ...m, status: success ? "DONE" : "FAILED" } : m))
    );
    setRobot((r) => ({
      ...r,
      state: "Online",
      currentMissionId: undefined,
      battery: Math.max(0, r.battery - 3),
      lastTreeSeen: running.type === "TREE" ? running.targetId : r.lastTreeSeen,
    }));
    addLog(success ? "INFO" : "CRIT", `Mission ${success ? "done" : "failed"}: ${running.action} ${running.targetLabel}`);
  }

  function cancelMission(id: string) {
    setMissions((prev) =>
      prev.map((m) => (m.id === id && m.status === "PENDING" ? { ...m, status: "CANCELLED" } : m))
    );
    addLog("WARN", `Mission cancelled: ${id}`);
  }

  function simulateRobotOffline() {
    setRobot((r) => ({ ...r, state: "Offline", health: "Warning" }));
    addLog("WARN", "Robot went offline (demo).");
  }

  function simulateRobotOnline() {
    setRobot((r) => ({ ...r, state: "Online", health: "OK", comms: "OK" }));
    addLog("INFO", "Robot online.");
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-green-700">ROBOT</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              Robot Control Center
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Monitor status, manage missions, and track execution logs (demo).
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/owner/farms/${farmId}`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              Back to Farm
            </Link>
            <Link
              href={`/owner/farms/${farmId}/trees`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              🌳 Trees
            </Link>
            <Link
              href={`/owner/farms/${farmId}/zones`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              📍 Zones
            </Link>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          <Kpi title="Pending" value={String(kpi.pending)} icon="🕒" />
          <Kpi title="Running" value={String(kpi.running)} icon="🚀" />
          <Kpi title="Done" value={String(kpi.done)} icon="✅" />
          <Kpi title="Failed" value={String(kpi.failed)} icon="❌" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-green-700">STATUS</div>
              <div className="mt-2 text-xl font-extrabold text-gray-900">{robot.name}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Chip cls={stateChipClass(robot.state)}>{robot.state}</Chip>
                <Chip cls={healthChipClass(robot.health)}>{robot.health}</Chip>
              </div>
              <div className="mt-3 text-sm text-gray-600 font-semibold">Last sync: {robot.lastSync}</div>
            </div>

            <div className="rounded-3xl bg-[#F7F8F4] border border-gray-200 p-5 min-w-[170px]">
              <div className="text-xs font-extrabold text-gray-500 uppercase">Battery</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">{robot.battery}%</div>
              <div className="mt-3 h-3 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${robot.battery}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <Mini label="Camera" value={robot.camera} danger={robot.camera === "Fail"} />
            <Mini label="Motors" value={robot.motors} danger={robot.motors === "Fail"} />
            <Mini label="Comms" value={robot.comms} danger={robot.comms === "Fail"} />
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <Mini label="Last Tree Seen" value={robot.lastTreeSeen ?? "—"} />
            <Mini label="Last Zone" value={robot.lastZone ?? "—"} />
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button onClick={simulateStartNextMission} className={primaryBtn}>
              Start next mission
            </button>
            <button onClick={() => simulateCompleteMission(true)} className={successBtn}>
              Complete (success)
            </button>
            <button onClick={() => simulateCompleteMission(false)} className={dangerBtn}>
              Complete (fail)
            </button>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            <button onClick={simulateRobotOffline} className={secondaryBtn}>
              Simulate Offline
            </button>
            <button onClick={simulateRobotOnline} className={secondaryBtn}>
              Simulate Online
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="text-sm font-extrabold text-green-700">CURRENT MISSION</div>

          {currentMission ? (
            <div className="mt-4 rounded-3xl border border-gray-200 bg-[#F7F8F4] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">
                    {currentMission.action} • {currentMission.targetLabel}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 font-semibold">
                    Type: {currentMission.type} • Created: {currentMission.createdAt}
                  </div>
                </div>
                <Chip cls={statusChipClass(currentMission.status)}>{currentMission.status}</Chip>
              </div>

              {currentMission.durationMin && (
                <div className="mt-3 text-sm text-gray-700 font-semibold">
                  Duration: {currentMission.durationMin} min
                </div>
              )}

              {currentMission.notes && (
                <div className="mt-3 text-sm text-gray-700 font-semibold">
                  Notes: {currentMission.notes}
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-white border border-gray-200 p-4">
                <div className="text-xs font-extrabold text-gray-500 uppercase">Execution logic (demo)</div>
                <p className="mt-2 text-sm text-gray-700 font-semibold">
                  The robot moves in the row and stops when it detects the marker (ArUco/QR) of the target.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
              No mission running.
            </div>
          )}

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
            <div className="font-extrabold text-gray-900">Quick Actions</div>
            <p className="mt-2 text-sm text-gray-600 font-semibold">
              These are owner-level controls (demo). Task status in the field is updated by the worker/mobile app.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <button className={secondaryBtn}>Emergency Stop</button>
              <button className={secondaryBtn}>Return to Base</button>
              <button className={secondaryBtn}>Calibrate Camera</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-green-700">MISSION QUEUE</div>
              <h2 className="mt-2 text-xl font-extrabold text-gray-900">Pending & History</h2>
            </div>
            <div className="text-sm font-extrabold text-gray-500">{missions.length}</div>
          </div>

          <div className="mt-5 grid gap-4">
            {missions.map((m) => (
              <div key={m.id} className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-gray-900">
                      {m.action} • <span className="text-green-800">{m.targetLabel}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 font-semibold">
                      {m.type} • Created: {m.createdAt}
                      {m.durationMin ? ` • ${m.durationMin} min` : ""}
                    </div>
                  </div>
                  <Chip cls={statusChipClass(m.status)}>{m.status}</Chip>
                </div>

                {m.notes && <div className="mt-3 text-sm text-gray-700 font-semibold">Notes: {m.notes}</div>}

                {m.status === "PENDING" && (
                  <div className="mt-4">
                    <button
                      onClick={() => cancelMission(m.id)}
                      className="border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}

            {missions.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
                No missions yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-green-700">LOGS</div>
              <h2 className="mt-2 text-xl font-extrabold text-gray-900">Robot Events</h2>
            </div>
            <button
              onClick={() => setLogs([])}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold"
            >
              Clear
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {logs.map((l) => (
              <div key={l.id} className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-extrabold text-gray-900">{l.time}</div>
                  <LogChip level={l.level} />
                </div>
                <div className="mt-2 text-sm text-gray-700 font-semibold">{l.msg}</div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
                No logs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryBtn =
  "bg-green-700 hover:bg-green-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60";

const successBtn =
  "bg-blue-700 hover:bg-blue-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-blue-300/60";

const dangerBtn =
  "bg-red-700 hover:bg-red-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-red-300/60";

const secondaryBtn =
  "border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-green-300/60";

function Kpi({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-[#F7F8F4] border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-extrabold text-gray-500 uppercase">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{value}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-white border border-gray-200 grid place-items-center text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Chip({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{children}</span>;
}

function Mini({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border border-gray-200 p-4 ${danger ? "bg-red-50" : "bg-[#F7F8F4]"}`}>
      <div className="text-[11px] font-extrabold text-gray-500 uppercase">{label}</div>
      <div className={`mt-1 text-sm font-extrabold truncate ${danger ? "text-red-700" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function LogChip({ level }: { level: "INFO" | "WARN" | "CRIT" }) {
  const cls =
    level === "INFO"
      ? "bg-blue-100 text-blue-800"
      : level === "WARN"
        ? "bg-orange-100 text-orange-800"
        : "bg-red-100 text-red-800";
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{level}</span>;
}
