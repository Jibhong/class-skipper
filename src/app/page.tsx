"use client";

import BuildingRoomSelector from "@/lib/client/components/BuildingRoomSelector";
import Calendar, { DateStateRecord } from "@/lib/client/components/calendar";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const dummyRecords: DateStateRecord[] = [
  { date: { year: 2026, month: 1, day: 5 }, state: 1 }, // attend
  { date: { year: 2026, month: 1, day: 6 }, state: 1 }, // attend
  { date: { year: 2026, month: 1, day: 7 }, state: 0 }, // absent
  { date: { year: 2026, month: 1, day: 9 }, state: 2 }, // day off
  { date: { year: 2026, month: 2, day: 14 }, state: 0 }, // absent
  { date: { year: 2026, month: 2, day: 15 }, state: 2 }, // day off
  { date: { year: 2026, month: 2, day: 23 }, state: 1 }, // attend
  { date: { year: 2026, month: 2, day: 24 }, state: 0 }, // absent
  { date: { year: 2026, month: 2, day: 25 }, state: 2 }, // day off
];
export default function Home() {
  const [records, setRecords] = useState<DateStateRecord[]>([]);

  useEffect(() => {
    async function fetchDayOff(monthString:string) {
      try {
        const ref = doc(singletonFirestorePublic, "day-off", monthString);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.warn("No data found");
          return;
        }

        const data = snap.data();
        const binNumber = data?.bin ?? 0;

        const bin: boolean[] = Array.from(
          { length: 31 },
          (_, i) => ((binNumber >> i) & 1) === 1,
        );
        console.log(bin);
        const mapped: DateStateRecord[] = bin.map((data, i) => ({
          date: {
            year: 2026,
            month: 1,
            day: i + 1, // index -> day
          },
          state: data ? 2 : -1,
        }));

        setRecords(mapped);
        console.log(mapped);
      } catch (err) {
        console.error(err);
      }
    }

    fetchDayOff("2026-01");
  }, []);
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <BuildingRoomSelector />
      <Calendar
        startDay={{
          day: 0,
          month: 1,
          year: 2026,
        }}
        endDay={{
          day: 0,
          month: 12,
          year: 2026,
        }}
        dayRecords={records}
      />
    </main>
  );
}
