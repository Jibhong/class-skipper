"use client";

import React from "react";
import { Header } from "@/lib/client/components/Components";

// 1. Define types for the Timetable data structure
interface PeriodData {
  subject: string;
  id?: string;
  teacher?: string;
}

interface TimetableData {
  [day: string]: {
    [periodIndex: number]: PeriodData;
  };
}

// 2. Define columns configuration chronologically
interface ColumnConfig {
  type: "period" | "break";
  label: string;
  time: string;
  periodIndex?: number;
  durationMinutes: number;
}

const COLUMNS: ColumnConfig[] = [
  { type: "period", label: "Period 1", time: "07:50 - 08:40", periodIndex: 1, durationMinutes: 50 },
  { type: "period", label: "Period 2", time: "08:40 - 09:30", periodIndex: 2, durationMinutes: 50 },
  { type: "break", label: "Break", time: "09:30 - 09:40", durationMinutes: 10 },
  { type: "period", label: "Period 3", time: "09:40 - 10:30", periodIndex: 3, durationMinutes: 50 },
  { type: "period", label: "Period 4", time: "10:30 - 11:20", periodIndex: 4, durationMinutes: 50 },
  { type: "break", label: "Lunch", time: "11:20 - 12:20", durationMinutes: 60 },
  { type: "period", label: "Period 5", time: "12:20 - 13:10", periodIndex: 5, durationMinutes: 50 },
  { type: "period", label: "Period 6", time: "13:10 - 14:00", periodIndex: 6, durationMinutes: 50 },
  { type: "break", label: "Break", time: "14:00 - 14:10", durationMinutes: 10 },
  { type: "period", label: "Period 7", time: "14:10 - 15:00", periodIndex: 7, durationMinutes: 50 },
  { type: "period", label: "Period 8", time: "15:00 - 15:50", periodIndex: 8, durationMinutes: 50 },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// 3. Define the dummy data representing a typical school timetable



import { useEffect, useState, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";

function TimetableContent() {
  const roomId = "67"; // fallback to "67"

  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimetable() {
      setLoading(true);
      const newData: TimetableData = {};

      try {
        const fetchPromises = DAYS.map(async (dayName, index) => {
          const dayId = index+1;
          newData[dayName] = {};
          
          const classRef = collection(
            singletonFirestorePublic,
            `rooms/${roomId}/table/${dayId}/class`
          );
          
          const snapshot = await getDocs(classRef);
          snapshot.forEach((doc) => {
            const periodData = doc.data();
            const periodId = parseInt(doc.id, 10);
            
            if (periodId >= 1 && periodId <= 8) {
              newData[dayName][periodId] = {
                subject: periodData.subject,
                id: periodData.id,
                teacher: periodData.teacher,
              };
            }
          });
        });

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      } finally {
        setTimetableData(newData);
        setLoading(false);
      }
    }

    if (roomId) {
      fetchTimetable();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-24 bg-white">
        <Header />
        <div className="text-slate-500 font-medium">Loading timetable for Room {roomId}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-24 bg-white">
      <Header />
      {/* Scrollable container for the minimal grid */}
      <div className="w-full max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        <div
          className="grid gap-1 p-0.5 w-fit mx-auto"
          style={{
            gridTemplateColumns: "80px 110px 120px 80px 110px 110px 80px 110px 110px 80px 110px 110px",
          }}
        >
          {/* Header Row */}
          {/* Day / Time Corner Header */}
          <div className="bg-slate-100/80 text-slate-600 font-semibold rounded-lg p-2 text-xs flex items-center justify-center">
            Day / Time
          </div>
          {/* Column Headers */}
          {COLUMNS.map((col, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-xs font-semibold flex flex-col justify-center items-center text-center ${col.type === "break" ? "text-slate-500 bg-slate-100/50" : "text-slate-700 bg-slate-100/80"
                }`}
            >
              <div>{col.label}</div>
              <div className="text-[9px] font-normal text-slate-400 mt-0.5">
                {col.time}
              </div>
            </div>
          ))}

          {/* Grid Body */}
          {DAYS.map((day, dayIdx) => (
            <React.Fragment key={day}>
              {/* Day Label Cell */}
              <div className="p-2 font-semibold text-xs text-slate-700 bg-slate-100/80 rounded-lg flex items-center justify-center text-center">
                {day}
              </div>

              {/* Period & Break cells */}
              {COLUMNS.map((col, colIdx) => {
                if (col.type === "break") {
                  // Only render the break cell once, spanning vertically across all rows
                  if (dayIdx !== 0) return null;
                  return (
                    <div
                      key={`break-${colIdx}`}
                      className="bg-slate-100/60 text-center flex flex-col items-center justify-center p-1.5 rounded-lg"
                      style={{ gridRow: `span ${DAYS.length}` }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {col.label}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                        {col.durationMinutes}m
                      </span>
                    </div>
                  );
                } else {
                  const classInfo = timetableData[day]?.[col.periodIndex!];
                  if (classInfo) {
                    return (
                      <div
                        key={`period-${day}-${colIdx}`}
                        className="p-2 text-[11px] bg-pink-50/70 text-slate-800 rounded-lg flex flex-col justify-center gap-0.5 hover:bg-pink-100/60 transition-colors duration-150 leading-tight"
                      >
                        <span className="font-semibold leading-tight text-slate-800">
                          {classInfo.subject}
                        </span>
                        {classInfo.id && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
                            {classInfo.id}
                          </span>
                        )}
                        {classInfo.teacher && (
                          <span className="text-[9px] text-slate-400 italic font-normal">
                            {classInfo.teacher}
                          </span>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`period-${day}-${colIdx}`}
                        className="p-2 text-[10px] bg-slate-50/40 text-slate-300 italic rounded-lg flex items-center justify-center hover:bg-slate-100/40 transition-colors duration-150"
                      >
                        Free Period
                      </div>
                    );
                  }
                }
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TimetableContent />
    </Suspense>
  );
}
