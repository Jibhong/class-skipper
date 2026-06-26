"use client"

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react"
import { singletonFirestorePublic } from "../singleton/client.firebasePublic";


export default function RoomSelector() {
  const [room, setRoom] = useState("");
  const [allRooms, setAllRooms] = useState<string[]>([]);
  useEffect(() => {
    async function fetchAllRoom() {
      const snapshot = await getDocs(collection(singletonFirestorePublic, "rooms"));
      const rooms: string[] = snapshot.docs.map((doc) => doc.id);
      setAllRooms(rooms);
    }
    fetchAllRoom();
  }, []);
  return (
    <div className="w-full max-w-xl">
      <select
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">เลือกห้อง</option>
        {allRooms.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  )
}