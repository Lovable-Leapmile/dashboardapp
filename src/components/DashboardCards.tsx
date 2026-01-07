import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Package, Layers, Zap, Activity, Flame, Battery } from "lucide-react";
import { getRobotManagerBase, getNanostoreBase } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";

interface RobotInfo {
  robot_name: string;
  robot_num_rows: number;
  robot_num_racks: number;
  robot_num_slots: number;
  robot_num_depths: number;
  updated_at: string;
}

interface SlotInfo {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  occupiedPercent: number;
}

interface TrayInfo {
  totalTrays: number;
  occupiedTrays: number;
  freeTrays: number;
  occupiedPercent: number;
}

interface PowerInfo {
  voltage: string;
  current: string;
  power: string;
  energy: string;
  updatedAt: string | null;
}

export const DashboardCards = () => {
  const [robotInfo, setRobotInfo] = useState<RobotInfo | null>(null);
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);
  const [trayInfo, setTrayInfo] = useState<TrayInfo | null>(null);
  const [powerInfo, setPowerInfo] = useState<PowerInfo | null>(null);

  const formatToIST = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const fetchRobotInfo = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;
      const response = await fetch(`${getRobotManagerBase()}/robots`, {
        headers: { "Authorization": token, "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        setRobotInfo(data.records[0]);
      }
    } catch (error) {
      console.error("Error fetching robot info:", error);
    }
  };

  const fetchSlotInfo = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;
      const [slotsResponse, traysResponse] = await Promise.all([
        fetch(`${getRobotManagerBase()}/slots_count?slot_status=active`, {
          headers: { "Authorization": token, "Content-Type": "application/json" }
        }),
        fetch(`${getRobotManagerBase()}/trays?tray_status=active`, {
          headers: { "Authorization": token, "Content-Type": "application/json" }
        })
      ]);

      const slotsData = await slotsResponse.json();
      const traysData = await traysResponse.json();

      const totalSlots = slotsData.records?.[0]?.total_count || 0;
      const occupiedSlots = traysData.records ? traysData.records.length : 0;
      const freeSlots = totalSlots - occupiedSlots;
      const occupiedPercent = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      setSlotInfo({ totalSlots, occupiedSlots, freeSlots, occupiedPercent });
    } catch (error) {
      console.error("Error fetching slot info:", error);
    }
  };

  const fetchTrayInfo = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;
      const [occupiedResponse, freeResponse] = await Promise.all([
        fetch(`${getNanostoreBase()}/occupied_trays?occupied=true`, {
          headers: { "Authorization": token, "Content-Type": "application/json" }
        }),
        fetch(`${getNanostoreBase()}/occupied_trays?occupied=false`, {
          headers: { "Authorization": token, "Content-Type": "application/json" }
        })
      ]);

      const occupiedData = await occupiedResponse.json();
      const freeData = await freeResponse.json();

      const occupiedTrays = occupiedData.records?.[0]?.count || 0;
      const freeTrays = freeData.records?.[0]?.count || 0;
      const totalTrays = occupiedTrays + freeTrays;
      const occupiedPercent = totalTrays > 0 ? (occupiedTrays / totalTrays) * 100 : 0;

      setTrayInfo({ totalTrays, occupiedTrays, freeTrays, occupiedPercent });
    } catch (error) {
      console.error("Error fetching tray info:", error);
    }
  };

  const fetchPowerInfo = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;
      // First try to fetch today's data
      let response = await fetch(`${getRobotManagerBase()}/robot_power?today=true&num_records=1`, {
        headers: { "Authorization": token, "Content-Type": "application/json" }
      });
      let data = await response.json();
      
      // If today's data is not available, fetch the most recent data regardless of date
      if (data.status !== "success" || !data.records || data.records.length === 0) {
        response = await fetch(`${getRobotManagerBase()}/robot_power?num_records=1`, {
          headers: { "Authorization": token, "Content-Type": "application/json" }
        });
        data = await response.json();
      }
      
      if (data.status === "success" && data.records && data.records.length > 0) {
        const record = data.records[0];
        setPowerInfo({
          voltage: `${record.voltage ?? 'N/A'} V`,
          current: `${record.current ?? 'N/A'} A`,
          power: `${record.max_demand_active_power ?? 'N/A'} kW`,
          energy: `${record.total_active_energy_kwh ?? 'N/A'} kWh`,
          updatedAt: record.updated_at || null
        });
      } else {
        // No data available at all
        setPowerInfo({
          voltage: "N/A",
          current: "N/A",
          power: "N/A",
          energy: "N/A",
          updatedAt: null
        });
      }
    } catch (error) {
      console.error("Error fetching power info:", error);
      setPowerInfo({
        voltage: "N/A",
        current: "N/A",
        power: "N/A",
        energy: "N/A",
        updatedAt: null
      });
    }
  };

  const fetchAllData = () => {
    fetchRobotInfo();
    fetchSlotInfo();
    fetchTrayInfo();
    fetchPowerInfo();
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 mt-3">
      {/* Row 1: Robot Information + Power Information */}
      <div className="grid grid-cols-2 gap-2">
        {/* Robot Information Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 flex flex-col">
          <CardHeader className="pb-1 pt-2 px-3 border-b border-primary/20">
            <CardTitle className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Robot Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
            {robotInfo ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold text-primary truncate">{robotInfo.robot_name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Rows:</span>
                    <span className="font-bold">{robotInfo.robot_num_rows}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Racks:</span>
                    <span className="font-bold">{robotInfo.robot_num_racks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Slots:</span>
                    <span className="font-bold">{robotInfo.robot_num_slots}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-bold">{robotInfo.robot_num_depths}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-1 text-xs">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Robot Power Card */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 flex flex-col">
          <CardHeader className="pb-1 pt-2 px-3 border-b border-amber-500/20">
            <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Power Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
            {powerInfo ? (
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Voltage:</span>
                  <span className="font-bold">{powerInfo.voltage}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-bold">{powerInfo.current}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-bold text-amber-600">{powerInfo.power}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                  <Battery className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground">Energy:</span>
                  <span className="font-bold text-green-600">{powerInfo.energy}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-1 text-xs">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Slot Information + Tray Information */}
      <div className="grid grid-cols-2 gap-2">
        {/* Slot Information Card */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 flex flex-col">
          <CardHeader className="pb-1 pt-2 px-3 border-b border-blue-500/20">
            <CardTitle className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Slot Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
            {slotInfo ? (
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">{slotInfo.totalSlots}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                    <span className="text-muted-foreground">Occupied:</span>
                    <span className="font-bold text-blue-600">{slotInfo.occupiedSlots}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                    <span className="text-muted-foreground">Free:</span>
                    <span className="font-bold text-green-600">{slotInfo.freeSlots}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                  <span className="text-muted-foreground whitespace-nowrap">Occupancy:</span>
                  <Progress value={slotInfo.occupiedPercent} className="h-1.5 flex-1" />
                  <span className="font-bold whitespace-nowrap">{slotInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-1 text-xs">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Tray Information Card */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 flex flex-col">
          <CardHeader className="pb-1 pt-2 px-3 border-b border-purple-500/20">
            <CardTitle className="text-xs font-bold text-purple-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Tray Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
            {trayInfo ? (
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">{trayInfo.totalTrays}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                    <span className="text-muted-foreground">Occupied:</span>
                    <span className="font-bold text-purple-600">{trayInfo.occupiedTrays}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                    <span className="text-muted-foreground">Free:</span>
                    <span className="font-bold text-green-600">{trayInfo.freeTrays}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                  <span className="text-muted-foreground whitespace-nowrap">Occupancy:</span>
                  <Progress value={trayInfo.occupiedPercent} className="h-1.5 flex-1" />
                  <span className="font-bold whitespace-nowrap">{trayInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-1 text-xs">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
