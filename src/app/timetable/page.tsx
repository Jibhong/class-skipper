import React, { Suspense } from "react";
import Timetable from "@/lib/client/components/Timetable";
import { Header } from "@/lib/client/components/Components";

export default function TimetablePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-24 bg-white">
        <Header />
        <Timetable />
      </div>
    </Suspense>
  );
}

