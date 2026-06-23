"use client"

import { useState } from "react"

const ROOMS = [
  "28", "29", "30",
  "111", "112",
  "67", "76", "79", "80", "81"
]

export default function RoomSelector() {
  const [room, setRoom] = useState("")

  return (
    <div className="w-full max-w-xl p-4">
      <select
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">เลือกห้อง</option>
        {ROOMS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  )
}