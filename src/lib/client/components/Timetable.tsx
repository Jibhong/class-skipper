"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { getPeriod } from "@/lib/shared/attendanceCodec";

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

// Map day-of-week (0=Sun) to DAYS index
function dowToDayName(dow: number): string | null {
  // 1=Mon → "Monday", 2=Tue → "Tuesday", …, 5=Fri → "Friday"
  if (dow >= 1 && dow <= 5) return DAYS[dow - 1];
  return null;
}

interface TimetableProps {
  /** Base64-encoded attendance for the current month */
  attendance?: string;
  /** Callback when a period is toggled. dayOfMonth is 1-indexed, period is 1-indexed. */
  onTogglePeriod?: (dayOfMonth: number, period: number) => void;
  /** Day-of-month numbers for the week being viewed (from calendar row) */
  weekDays?: number[];
  /** Current month (1-indexed) */
  month?: number;
  /** Current year */
  year?: number;
}

export default function Timetable({
  attendance,
  onTogglePeriod,
  weekDays,
  month,
  year,
}: TimetableProps) {
  const roomId = "67"; // fallback to "67"

  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimetable() {
      setLoading(true);
      const newData: TimetableData = {};

      try {
        const fetchPromises = DAYS.map(async (dayName, index) => {
          const dayId = index + 1;
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

    fetchTimetable();
  }, [roomId]);

  // Build a mapping: dayName → dayOfMonth (for the week being viewed)
  const dayOfMonthMap: Record<string, number> = {};
  if (weekDays && month && year) {
    for (const dayNum of weekDays) {
      const date = new Date(year, month - 1, dayNum);
      const dow = date.getDay(); // 0=Sun, 1=Mon, ...
      const name = dowToDayName(dow);
      if (name) {
        dayOfMonthMap[name] = dayNum;
      }
    }
  }

  const hasAttendanceContext = attendance !== undefined && Object.keys(dayOfMonthMap).length > 0;

  const handlePeriodClick = (day: string, periodIndex: number) => {
    if (hasAttendanceContext && onTogglePeriod) {
      const dayNum = dayOfMonthMap[day];
      if (dayNum) {
        onTogglePeriod(dayNum, periodIndex);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-slate-500 font-medium">Loading timetable for Room {roomId}...</div>
    );
  }

  return (
    // Scrollable container for the minimal grid
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
              <div>
                <div>{day}</div>
                {hasAttendanceContext && dayOfMonthMap[day] && (
                  <div className="text-[9px] font-normal text-slate-400 mt-0.5">
                    {dayOfMonthMap[day]}/{month}
                  </div>
                )}
              </div>
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
                  // Determine attendance state from base64 string
                  let cellBgClass: string;
                  const isClickable = hasAttendanceContext && !!dayOfMonthMap[day];

                  if (hasAttendanceContext && dayOfMonthMap[day]) {
                    const attended = getPeriod(
                      attendance!,
                      dayOfMonthMap[day],
                      col.periodIndex!,
                    );
                    cellBgClass = attended
                      ? "bg-emerald-400 hover:bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-800 hover:bg-slate-300";
                  } else {
                    // No attendance context (standalone page) — show default
                    cellBgClass = "bg-slate-200 text-slate-800 hover:bg-slate-300";
                  }

                  return (
                    <div
                      key={`period-${day}-${colIdx}`}
                      onClick={() =>
                        isClickable && handlePeriodClick(day, col.periodIndex!)
                      }
                      className={`p-2 text-[11px] rounded-lg flex flex-col justify-center gap-0.5 transition-all duration-150 leading-tight ${isClickable ? "cursor-pointer select-none" : ""} ${cellBgClass} hover:brightness-105 active:scale-[0.98]`}
                    >
                      <span className="font-semibold leading-tight">
                        {classInfo.subject}
                      </span>
                      {classInfo.id && (
                        <span className="text-[10px] opacity-90 flex items-center gap-0.5 font-medium">
                          {classInfo.id}
                        </span>
                      )}
                      {classInfo.teacher && (
                        <span className="text-[9px] opacity-75 italic font-normal">
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
  );
}
