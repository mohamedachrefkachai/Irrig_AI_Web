"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type MissionType = "TREE" | "ZONE";
export type MissionAction = "IRRIGATE" | "SPRAY" | "INSPECT";
export type MissionStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED" | "CANCELLED";

export type RuntimeMission = {
  id: string;
  type: MissionType;
  action: MissionAction;
  targetId: string;
  targetLabel: string;
  durationMin?: number;
  createdAt: string;
  status: MissionStatus;
  template?: string;
  notes?: string;
};

type AddMissionInput = Omit<RuntimeMission, "id" | "status" | "createdAt">;

type FarmRuntimeContextValue = {
  missions: RuntimeMission[];
  addMission: (mission: AddMissionInput) => RuntimeMission;
  setMissions: Dispatch<SetStateAction<RuntimeMission[]>>;
};

const FarmRuntimeContext = createContext<FarmRuntimeContextValue | null>(null);

function nowLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Today ${hh}:${mm}`;
}

function missionId() {
  return `m_${Math.random().toString(16).slice(2)}`;
}

export function FarmRuntimeProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<RuntimeMission[]>([]);

  const value = useMemo<FarmRuntimeContextValue>(
    () => ({
      missions,
      setMissions,
      addMission: (mission) => {
        const created: RuntimeMission = {
          id: missionId(),
          createdAt: nowLabel(),
          status: "PENDING",
          ...mission,
        };
        setMissions((prev) => [created, ...prev]);
        return created;
      },
    }),
    [missions]
  );

  return <FarmRuntimeContext.Provider value={value}>{children}</FarmRuntimeContext.Provider>;
}

export function useFarmRuntime() {
  const ctx = useContext(FarmRuntimeContext);
  if (!ctx) {
    throw new Error("useFarmRuntime must be used within FarmRuntimeProvider");
  }
  return ctx;
}
