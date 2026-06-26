import BuildingRoomSelector from "@/lib/client/components/BuildingRoomSelector";
import Calendar, { DayData } from "@/lib/client/components/Calendar";

export default function Home() {

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <BuildingRoomSelector />
      <Calendar />
    </main>
  );
}
