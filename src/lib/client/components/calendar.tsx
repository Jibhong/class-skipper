import { useState, useEffect } from "react"

type Day = {
  day: number;
  month: number;
  year: number;
};
export default function Calendar() {
  const [nowDay, setNowDay] = useState(Math.floor((Date.now() / 1000) / 86400))
  const startday: Day = { year: 2026, month: 1, day: 1 };
  const endday: Day = { year: 2026, month: 12, day: 31 };
  useEffect(() => {
    function initCalendar() {
      console.log(nowDay)
    }

    initCalendar()
  }, [])

  return (
    <div className="w-xl flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      style={{
        scrollbarWidth: 'none', /* Modern browsers and Firefox */
        msOverflowStyle: 'none' /* IE and Edge */
      }}>

      {/* Multiple pages */}
      <CalendarPage />
      <CalendarPage />
      <CalendarPage />
      <CalendarPage />
      <CalendarPage />

    </div>
  )

}

function CalendarPage() {
  const dateText = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="min-w-xl p-4 snap-center">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dateText.map((data, i) => (
          <div
            key={i}
            className={`px-2 rounded bg-slate-300 ${data === "Sun" ? "text-red-500" : ""}`}>
            {data}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 gap-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="h-12 px-2 py-1 rounded bg-slate-200"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  )
}