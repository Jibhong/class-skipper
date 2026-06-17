"use client"

import Calendar from "@/lib/client/components/calendar"
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    function test() {
      console.log(process.env.NEXT_PUBLIC_A);
      console.log(process.env.B);
    }
    test()
  }, [])

  return (
    <main className="flex items-center justify-center h-screen">
      <Calendar />
    </main>
  )
}