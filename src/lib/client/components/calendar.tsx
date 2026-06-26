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

export type DayData = {
  day: Day;
  isDayOff: boolean;
  isAttened: boolean;
  isHaveNote: boolean;
};

type CalendarProps = {
  startDay: Day;
  endDay: Day;
  dayRecords: DayData[];
};


// Helper functions for date operations
function isSameDay(d1: Day, d2: Day): boolean {
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
}

export default function Calendar({ startDay, endDay, dayRecords }: CalendarProps) {
  const [allMonth, setAllMonth] = useState<Day[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [records, setRecords] = useState<DayData[]>(dayRecords);

  useEffect(() => {
    setRecords(dayRecords);
  }, [dayRecords]);

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
  const handleDayClick = (date: Day) => {
    const record = records.find(r => isSameDay(r.day, date));
    const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();

    if ((record && record.isDayOff) || dayOfWeek === 0 || dayOfWeek === 6) {
      // Day off is locked and clicking does nothing.
      return;
    }

    setRecords(prev => {
      const filtered = prev.filter(r => !isSameDay(r.day, date));
      if (record) {
        return [...filtered, { ...record, isAttened: !record.isAttened }];
      } else {
        return [...filtered, { day: date, isDayOff: false, isAttened: true, isHaveNote: false }];
      }
    });
  };
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
          <div key={i} className="snap-start shrink-0 w-full">
            <MonthView
              day={m}
              records={records}
              onDayClick={handleDayClick}
            />
          </div>
        ))}
      </div>
    </div>

  )
}

type MonthViewProps = {
  day: Day;
  records: DayData[];
  onDayClick: (date: Day) => void;
};
function MonthView({ day, records, onDayClick }: MonthViewProps) {
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
            className={`px-2 rounded bg-slate-300 ${data === "Sun" ? "text-red-500" : (data === "Sat" ? "text-violet-800" : "")}`}
          >
            {data}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 grid-rows-6 gap-1">
        {cells.map((cell, i) => {
          const isSunday = i % 7 === 0;
          const isSaturday = i % 7 === 6;
          let cellClass = "";
          let currentDay: Day | null = null;

          if (cell.type === "current") {
            currentDay = { year: day.year, month: day.month, day: cell.value };
            const record = records.find(r => isSameDay(r.day, currentDay!));
            let state: 0 | 1 | 2 | "Default" = "Default";
            if (record) {
              if (record.isDayOff) state = 2;
              else if (record.isAttened) state = 1;
              else state = 0;
            }

            if (state === 1) {
              // attend: Fill the day grid background with green.
              cellClass = "bg-emerald-400 text-white";
            } else if (state === 0) {
              // absent: Fill the day grid background with red.
              cellClass = "bg-rose-400 text-white";
            } else if (state === 2) {
              // day off: Fill the day grid background with amber.
              cellClass = "bg-violet-200 text-slate-400";
            } else {
              // Default state: Fill the day grid background with a light/neutral gray
              let textColor = "text-black";
              if (isSunday) textColor = "text-red-400";
              else if (isSaturday) textColor = "text-violet-800";
              cellClass = `bg-slate-200 ${textColor}`;
            }

            const isClickable = state !== 2 && !isSunday && !isSaturday;

            return (
              <div
                key={i}
                className={`h-12 px-2 py-1 rounded ${cellClass} ${isClickable
                  ? "cursor-pointer select-none transition-all hover:brightness-95 active:scale-95"
                  : ""
                  }`}
                onClick={() => {
                  if (isClickable && currentDay) {
                    onDayClick(currentDay! || null);
                  }
                }}
              >
                {cell.value}
              </div>
            );
          } else {
            cellClass = isSunday ? "bg-slate-100 text-red-300" : "bg-slate-100 text-slate-400";
            return (
              <div
                key={i}
                className={`h-12 px-2 py-1 rounded ${cellClass}`}
              >
                {cell.value}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
