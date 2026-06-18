import { useState, useEffect } from "react"
import { devwarn } from "@/lib/client/devlog";
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
export default function Calendar() {
  const [nowDay, setNowDay] = useState(Math.floor((Date.now() / 1000) / 86400))
  const [allMonth, setAllMonth] = useState<Day[]>([]);
  useEffect(() => {
    async function loadAllMonth() {
      const result: Day[] = []

      const startDay: Day = { year: 2026, month: 1, day: 1 };
      const endDay: Day = { year: 2026, month: 12, day: 31 };

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

      setAllMonth(result);
    }
    loadAllMonth()
  }, [])

  return (
    <div
      className="w-xl flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}
    >
      {allMonth.map((m, i) => (
        <div key={i} className="snap-start shrink-0 w-full">
          <MonthView day={m} />
        </div>
      ))}
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

          return (
            <div
              key={i}
              className={`h-12 px-2 py-1 rounded 
                ${cell.type === "current" && !isSunday ? "bg-slate-200 text-black" : null}
                ${cell.type === "current" && isSunday ? "bg-slate-200 text-red-400" : null}
                ${cell.type !== "current" && !isSunday ? "bg-slate-100 text-slate-400" : null}
                ${cell.type !== "current" && isSunday ? "bg-slate-100 text-red-300" : null}
              `}
            >
              {cell.value}
            </div>
          );
        })}
      </div>
    </div>
  );
}