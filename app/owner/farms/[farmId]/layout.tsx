"use client";

import { FarmRuntimeProvider } from "./_context/FarmRuntimeContext";

export default function FarmLayout({ children }: { children: React.ReactNode }) {
  return <FarmRuntimeProvider>{children}</FarmRuntimeProvider>;
}
