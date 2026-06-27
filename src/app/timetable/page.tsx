"use client";

import React from "react";
import { Header } from "@/lib/client/components/Components";

// 1. Define types for the Timetable data structure
interface PeriodData {
  subject: string;
  room?: string;
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
const TIMETABLE_DATA: TimetableData = {
  Monday: {
    1: { subject: "dummy subject 1", room: "dm_room_1", teacher: "dm_tch_1" },
    2: { subject: "dummy subject 2", room: "dm_room_2", teacher: "dm_tch_2" },
    3: { subject: "dummy subject 3", room: "dm_room_3", teacher: "dm_tch_3" },
    4: { subject: "dummy subject 4", room: "dm_room_4", teacher: "dm_tch_4" },
    5: { subject: "dummy subject 5", room: "dm_room_5", teacher: "dm_tch_5" },
    6: { subject: "dummy subject 6", room: "dm_room_6", teacher: "dm_tch_6" },
    7: { subject: "dummy subject 7", room: "dm_room_7", teacher: "dm_tch_7" },
    8: { subject: "dummy subject 8", room: "dm_room_8", teacher: "dm_tch_8" },
  },
  Tuesday: {
    1: { subject: "dummy subject 9", room: "dm_room_9", teacher: "dm_tch_9" },
    2: { subject: "dummy subject 10", room: "dm_room_10", teacher: "dm_tch_10" },
    3: { subject: "dummy subject 11", room: "dm_room_11", teacher: "dm_tch_11" },
    4: { subject: "dummy subject 12", room: "dm_room_12", teacher: "dm_tch_12" },
    5: { subject: "dummy subject 13", room: "dm_room_13", teacher: "dm_tch_13" },
    6: { subject: "dummy subject 14", room: "dm_room_14", teacher: "dm_tch_14" },
    7: { subject: "dummy subject 15", room: "dm_room_15", teacher: "dm_tch_15" },
    8: { subject: "dummy subject 16", room: "dm_room_16", teacher: "dm_tch_16" },
  },
  Wednesday: {
    1: { subject: "dummy subject 17", room: "dm_room_17", teacher: "dm_tch_17" },
    2: { subject: "dummy subject 18", room: "dm_room_18", teacher: "dm_tch_18" },
    3: { subject: "dummy subject 19", room: "dm_room_19", teacher: "dm_tch_19" },
    4: { subject: "dummy subject 20", room: "dm_room_20", teacher: "dm_tch_20" },
    5: { subject: "dummy subject 21", room: "dm_room_21", teacher: "dm_tch_21" },
    6: { subject: "dummy subject 22", room: "dm_room_22", teacher: "dm_tch_22" },
    7: { subject: "dummy subject 23", room: "dm_room_23", teacher: "dm_tch_23" },
    8: { subject: "dummy subject 24", room: "dm_room_24", teacher: "dm_tch_24" },
  },
  Thursday: {
    1: { subject: "dummy subject 25", room: "dm_room_25", teacher: "dm_tch_25" },
    2: { subject: "dummy subject 26", room: "dm_room_26", teacher: "dm_tch_26" },
    3: { subject: "dummy subject 27", room: "dm_room_27", teacher: "dm_tch_27" },
    4: { subject: "dummy subject 28", room: "dm_room_28", teacher: "dm_tch_28" },
    5: { subject: "dummy subject 29", room: "dm_room_29", teacher: "dm_tch_29" },
    6: { subject: "dummy subject 30", room: "dm_room_30", teacher: "dm_tch_30" },
    7: { subject: "dummy subject 31", room: "dm_room_31", teacher: "dm_tch_31" },
    8: { subject: "dummy subject 32", room: "dm_room_32", teacher: "dm_tch_32" },
  },
  Friday: {
    1: { subject: "dummy subject 33", room: "dm_room_33", teacher: "dm_tch_33" },
    2: { subject: "dummy subject 34", room: "dm_room_34", teacher: "dm_tch_34" },
    3: { subject: "dummy subject 35", room: "dm_room_35", teacher: "dm_tch_35" },
    4: { subject: "dummy subject 36", room: "dm_room_36", teacher: "dm_tch_36" },
    5: { subject: "dummy subject 37", room: "dm_room_37", teacher: "dm_tch_37" },
    6: { subject: "dummy subject 38", room: "dm_room_38", teacher: "dm_tch_38" },
    7: { subject: "dummy subject 39", room: "dm_room_39", teacher: "dm_tch_39" },
    8: { subject: "dummy subject 40", room: "dm_room_40", teacher: "dm_tch_40" },
  },
};

export default function TimetablePage() {
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
                  const classInfo = TIMETABLE_DATA[day]?.[col.periodIndex!];
                  if (classInfo) {
                    return (
                      <div
                        key={`period-${day}-${colIdx}`}
                        className="p-2 text-[11px] bg-pink-50/70 text-slate-800 rounded-lg flex flex-col justify-center gap-0.5 hover:bg-pink-100/60 transition-colors duration-150 leading-tight"
                      >
                        <span className="font-semibold leading-tight text-slate-800">
                          {classInfo.subject}
                        </span>
                        {classInfo.room && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
                            {classInfo.room}
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
