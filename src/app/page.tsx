"use client";

import BuildingRoomSelector from "@/lib/client/components/BuildingRoomSelector";
import Calendar, { DayData } from "@/lib/client/components/calendar";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const dummyRecords: DayData[] = [
  { day: { year: 2026, month: 1, day: 5 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 1, day: 6 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 1, day: 7 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 1, day: 8 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 2, day: 5 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 2, day: 6 }, isDayOff: false, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 2, day: 7 }, isDayOff: true, isAttened: false, isHaveNote: false },
  { day: { year: 2026, month: 2, day: 8 }, isDayOff: false, isAttened: true, isHaveNote: false },
];
export default function Home() {
  const [records, setRecords] = useState<DayData[]>([]);

  useEffect(() => {
    async function fetchDayOff(monthString: string) {
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
        const mapped: DayData[] = bin
          .map((isOff, i) => ({
            day: {
              year: 2026,
              month: 1,
              day: i + 1,
            },
            isDayOff: isOff,
            isAttened: false,
            isHaveNote: false,
          }))
          .filter((r) => r.isDayOff);
        console.log(mapped);
        setRecords(mapped);
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
