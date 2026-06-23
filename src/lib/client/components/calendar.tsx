import { useState, useEffect, useRef } from "react"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const MONTH_NAMES = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
]

type Day = {
  day: number;
  month: number;
  year: number;
};

// Calendar range defined by the two existing variables at the module level
const startDay: Day = { year: 2026, month: 1, day: 1 };
const endDay: Day = { year: 2026, month: 12, day: 31 };

// Numeric states: 1 = attend, 0 = absent, 2 = day off
type DateState = 1 | 0 | 2;

type DateStateRecord = {
  date: Day;
  state: DateState;
};

// Dummy data mapping specific dates to states
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

// Helper functions for date operations
function isSameDay(d1: Day, d2: Day): boolean {
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
}

function isDateInRange(date: Day, start: Day, end: Day): boolean {
  const dVal = date.year * 10000 + date.month * 100 + date.day;
  const sVal = start.year * 10000 + start.month * 100 + start.day;
  const eVal = end.year * 10000 + end.month * 100 + end.day;
  return dVal >= sVal && dVal <= eVal;
}

function getDayState(date: Day): DateState | "Default" | undefined {
  if (!isDateInRange(date, startDay, endDay)) {
    return undefined;
  }
  const record = dummyRecords.find(r => isSameDay(r.date, date));
  if (record) {
    return record.state;
  }
  return "Default";
}

export default function Calendar() {
  const [allMonth, setAllMonth] = useState<Day[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const result: Day[] = []

    let y = startDay.year
    let m = startDay.month

    while (y < endDay.year || (y === endDay.year && m <= endDay.month)) {
      result.push({ year: y, month: m, day: 1 })

      m++
      if (m > 12) {
        m = 1
        y++
      }
    }

    setAllMonth(result)
  }, [])

  const scroll = (dir: number) => {
    if (!scrollRef.current) return
    const width = scrollRef.current.clientWidth

    scrollRef.current.scrollBy({
      left: dir * width,
      behavior: "smooth"
    })
  }

  return (
    <div className="max-w-xl mx-auto relative flex items-center justify-center">
      {/* Buttons */}
      <div className="absolute top-0 right-0 m-4 flex gap-2 z-10">
        
        <button
          onClick={() => scroll(-1)}
          className="p-2 rounded bg-slate-200 hover:bg-slate-300 hover:cursor-pointer"
        >
          <FaAngleLeft size={18} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="p-2 rounded bg-slate-200 hover:bg-slate-300 hover:cursor-pointer"
        >
          <FaAngleRight size={18} />
        </button>
      </div>
      {/* Scroll container */}

      <div
        ref={scrollRef}
        className="flex w-xl overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {allMonth.map((m, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-full"
          >
            <MonthView day={m} />
          </div>
        ))}
      </div>
    </div>
  )
}

type MonthViewProps = {
  day: Day;
};
function MonthView({ day }: MonthViewProps) {
  const dateText = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDay = new Date(day.year, day.month - 1, 1);
  const startWeekday = firstDay.getDay();

  const daysInMonth = new Date(day.year, day.month, 0).getDate();
  const daysInPrevMonth = new Date(day.year, day.month - 1, 0).getDate();

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const dateNum = i - startWeekday + 1;

    if (dateNum < 1) {
      // previous month
      return {
        value: daysInPrevMonth + dateNum,
        type: "prev",
      };
    }

    if (dateNum > daysInMonth) {
      // next month
      return {
        value: dateNum - daysInMonth,
        type: "next",
      };
    }

    return {
      value: dateNum,
      type: "current",
    };
  });

  return (
    <div className="min-w-xl p-4 snap-center">
      <div className="flex mb-1 gap-1 items-end">
        <div className="text-4xl mb-2">
          {MONTH_NAMES[day.month - 1]}
        </div>
        <div className="text-lg">
          {day.year}
        </div>
      </div>



      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dateText.map((data, i) => (
          <div
            key={i}
            className={`px-2 rounded bg-slate-300 ${data === "Sun" ? "text-red-500" : ""}`}
          >
            {data}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 grid-rows-6 gap-1">
        {cells.map((cell, i) => {
          const isSunday = i % 7 === 0;
          let cellClass = "";

          if (cell.type === "current") {
            const currentDay: Day = { year: day.year, month: day.month, day: cell.value };
            const state = getDayState(currentDay);

            if (state === 1) {
              // attend: Fill the day grid background with green.
              cellClass = "bg-emerald-400 text-white";
            } else if (state === 0) {
              // absent: Fill the day grid background with red.
              cellClass = "bg-rose-400 text-white";
            } else if (state === 2) {
              // day off: Fill the day grid background with gray, and change the day number text color to red.
              cellClass = "bg-amber-400 text-white";
            } else {
              // Default state: Fill the day grid background with a light/neutral gray (distinct from the 'day off' gray),
              // but KEEP the day number text color as the standard/default color.
              const textColor = isSunday ? "text-red-400" : "text-black";
              cellClass = `bg-slate-200 ${textColor}`;
            }
          } else {
            cellClass = isSunday ? "bg-slate-100 text-red-300" : "bg-slate-100 text-slate-400";
          }

          return (
            <div
              key={i}
              className={`h-12 px-2 py-1 rounded ${cellClass}`}
            >
              {cell.value}
            </div>
          );
        })}
      </div>
    </div>
  );
}