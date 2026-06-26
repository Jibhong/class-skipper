"use client";
import { useState, useEffect, useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { doc, getDoc } from "firebase/firestore";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function isSameDay(d1: Day, d2: Day): boolean {
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
}

export default function Calendar() {
  const [records, setRecords] = useState<DayData[]>([]);
  const [nowMonth, setNowMonth] = useState<Day>({ day: 0, month: 0, year: 0 });
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
              year: nowMonth.year,
              month: nowMonth.month,
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

    fetchDayOff(`${nowMonth.year}-${String(nowMonth.month).padStart(2, "0")}`);
  }, [nowMonth]);
  const [allMonths, setAllMonths] = useState<Day[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCalendarRange() {
      const snap = await getDoc(
        doc(singletonFirestorePublic, "calendar", "properties")
      );

      if (!snap.exists()) return;

      const data = snap.data();
      const startDate = new Date(data["start-calendar"]);
      const endDate = new Date(data["end-calendar"]);

      const startCalendar: Day = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };

      const endCalendar: Day = { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() };
      const result: Day[] = [];
      let y = startCalendar.year;
      let m = startCalendar.month;
      while (y < endCalendar.year || (y === endCalendar.year && m <= endCalendar.month)) {
        result.push({ year: y, month: m, day: 1 });
        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }
      setAllMonths(result);
    }
    fetchCalendarRange();
  }, []);

  const scroll = (dir: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleDayClick = (date: Day) => {
    const record = records.find((r) => isSameDay(r.day, date));
    const dow = new Date(date.year, date.month - 1, date.day).getDay();
    if (record?.isDayOff || dow === 0 || dow === 6) return;

    setRecords((prev) => {
      const filtered = prev.filter((r) => !isSameDay(r.day, date));
      return record
        ? [...filtered, { ...record, isAttened: !record.isAttened }]
        : [
          ...filtered,
          { day: date, isDayOff: false, isAttened: true, isHaveNote: false },
        ];
    });
  };
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (allMonths.length === 0) return;

    const observers: IntersectionObserver[] = [];

    monthRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const { year, month } = allMonths[idx];
            console.log({ year, month });
            setNowMonth({ year: year, month: month, day: nowMonth.day });
          }
        },
        {
          root: scrollRef.current,
          threshold: 0.5, // fires when >50% of the panel is visible
        },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [allMonths]);
  return (
    <div className="max-w-xl mx-auto relative flex items-center justify-center">
      <div className="absolute top-0 right-0 flex gap-2 z-10">
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

      <div
        ref={scrollRef}
        className="flex w-xl gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {allMonths.map((month, monthIdx) => {
          const firstDow = new Date(month.year, month.month - 1, 1).getDay();
          const daysInMonth = new Date(month.year, month.month, 0).getDate();
          const daysInPrevMonth = new Date(
            month.year,
            month.month - 1,
            0,
          ).getDate();

          const cells = Array.from({ length: 42 }).map((_, i) => {
            const dateNum = i - firstDow + 1;
            if (dateNum < 1)
              return {
                dateNumber: daysInPrevMonth + dateNum,
                isInThisMonth: false,
              };
            if (dateNum > daysInMonth)
              return {
                dateNumber: dateNum - daysInMonth,
                isInThisMonth: false,
              };
            return { dateNumber: dateNum, isInThisMonth: true };
          });

          return (
            <div
              key={monthIdx}
              ref={(el) => {
                monthRefs.current[monthIdx] = el;
              }}
              className="snap-start shrink-0 w-full min-w-xl snap-center"
            >
              <div className="flex mb-2 gap-1 items-end">
                <div className="text-4xl mb-2">
                  {MONTH_NAMES[month.month - 1]}
                </div>
                <div className="text-lg">{month.year}</div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_LABELS.map((label, idx) => (
                  <div
                    key={idx}
                    className={`px-2 rounded bg-slate-300 ${label === "Sun" ? "text-red-500" : label === "Sat" ? "text-violet-800" : ""}`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 grid-rows-6 gap-1">
                {cells.map((cell, i) => {
                  const isSunday = i % 7 === 0;
                  const isSaturday = i % 7 === 6;

                  if (!cell.isInThisMonth) {
                    return (
                      <div
                        key={i}
                        className={`h-12 px-2 py-1 rounded bg-slate-100 ${isSunday ? "text-red-300" : "text-slate-400"}`}
                      >
                        {cell.dateNumber}
                      </div>
                    );
                  }

                  const currentDay: Day = {
                    year: month.year,
                    month: month.month,
                    day: cell.dateNumber,
                  };
                  const record = records.find((r) =>
                    isSameDay(r.day, currentDay),
                  );
                  const isClickable =
                    !record?.isDayOff && !isSunday && !isSaturday;

                  let cellClass: string;
                  if (record?.isDayOff)
                    cellClass = "bg-violet-200 text-slate-400";
                  else if (record?.isAttened)
                    cellClass = "bg-emerald-400 text-white";
                  else if (record) cellClass = "bg-rose-400 text-white";
                  else
                    cellClass = `bg-slate-200 ${isSunday ? "text-red-400" : isSaturday ? "text-violet-800" : "text-black"}`;

                  return (
                    <div
                      key={i}
                      className={`h-12 px-2 py-1 rounded ${cellClass} ${isClickable ? "cursor-pointer select-none transition-all hover:brightness-95 active:scale-95" : ""}`}
                      onClick={() => isClickable && handleDayClick(currentDay)}
                    >
                      {cell.dateNumber}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
