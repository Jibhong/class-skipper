"use client"

import BuildingRoomSelector from "@/lib/client/components/BuildingRoomSelector"
import Calendar from "@/lib/client/components/calendar"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <BuildingRoomSelector />
      <Calendar />
    </main>
  )
}