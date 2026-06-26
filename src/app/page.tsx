import BuildingRoomSelector from "@/lib/client/components/BuildingRoomSelector";
import Calendar, { DayData } from "@/lib/client/components/Calendar";
import { Header } from "@/lib/client/components/Header";

export default function Home() {

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <BuildingRoomSelector />
        <Calendar />
      </div>
    </div>
  );
}
