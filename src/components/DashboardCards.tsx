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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      {/* Robot Information Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 flex flex-col min-h-0">
        <CardHeader className="pb-1 pt-2 px-3 border-b border-primary/20">
          <CardTitle className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Robot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
          {robotInfo ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-background/50 rounded p-1.5 text-xs">
                <span className="text-muted-foreground">Name</span>
                <span className="font-bold text-primary">{robotInfo.robot_name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <div className="text-center p-1.5 bg-background/80 rounded border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Rows</div>
                  <div className="text-sm font-bold">{robotInfo.robot_num_rows}</div>
                </div>
                <div className="text-center p-1.5 bg-background/80 rounded border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Racks</div>
                  <div className="text-sm font-bold">{robotInfo.robot_num_racks}</div>
                </div>
                <div className="text-center p-1.5 bg-background/80 rounded border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Slots</div>
                  <div className="text-sm font-bold">{robotInfo.robot_num_slots}</div>
                </div>
                <div className="text-center p-1.5 bg-background/80 rounded border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Depths</div>
                  <div className="text-sm font-bold">{robotInfo.robot_num_depths}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-xs">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Power Information Card */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 flex flex-col min-h-0">
        <CardHeader className="pb-1 pt-2 px-3 border-b border-amber-500/20">
          <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Power Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
          {powerInfo ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-background/50 rounded p-1.5 text-center border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Voltage</div>
                  <div className="text-sm font-bold">{powerInfo.voltage}</div>
                </div>
                <div className="bg-background/50 rounded p-1.5 text-center border border-border/50">
                  <div className="text-[10px] text-muted-foreground">Current</div>
                  <div className="text-sm font-bold">{powerInfo.current}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-amber-500/10 rounded p-1.5 border border-amber-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Power
                    </span>
                    <span className="font-bold text-amber-600">{powerInfo.power}</span>
                  </div>
                </div>
                <div className="bg-green-500/10 rounded p-1.5 border border-green-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      Energy
                    </span>
                    <span className="font-bold text-green-600">{powerInfo.energy}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-xs">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Slot Information Card */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 flex flex-col min-h-0">
        <CardHeader className="pb-1 pt-2 px-3 border-b border-blue-500/20">
          <CardTitle className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Slot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
          {slotInfo ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold">{slotInfo.totalSlots}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <div className="flex gap-1">
                  <div className="bg-blue-500/10 rounded p-1.5 text-center border border-blue-500/20 min-w-[50px]">
                    <div className="text-sm font-bold text-blue-600">{slotInfo.occupiedSlots}</div>
                    <div className="text-[9px] text-muted-foreground">Occupied</div>
                  </div>
                  <div className="bg-green-500/10 rounded p-1.5 text-center border border-green-500/20 min-w-[50px]">
                    <div className="text-sm font-bold text-green-600">{slotInfo.freeSlots}</div>
                    <div className="text-[9px] text-muted-foreground">Free</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Occupancy</span>
                <Progress value={slotInfo.occupiedPercent} className="h-1.5 flex-1" />
                <span className="font-bold">{slotInfo.occupiedPercent.toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-xs">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Tray Information Card */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 flex flex-col min-h-0">
        <CardHeader className="pb-1 pt-2 px-3 border-b border-purple-500/20">
          <CardTitle className="text-xs font-bold text-purple-600 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Tray Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 pb-2 flex-1 overflow-hidden">
          {trayInfo ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold">{trayInfo.totalTrays}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <div className="flex gap-1">
                  <div className="bg-purple-500/10 rounded p-1.5 text-center border border-purple-500/20 min-w-[50px]">
                    <div className="text-sm font-bold text-purple-600">{trayInfo.occupiedTrays}</div>
                    <div className="text-[9px] text-muted-foreground">Occupied</div>
                  </div>
                  <div className="bg-green-500/10 rounded p-1.5 text-center border border-green-500/20 min-w-[50px]">
                    <div className="text-sm font-bold text-green-600">{trayInfo.freeTrays}</div>
                    <div className="text-[9px] text-muted-foreground">Free</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Occupancy</span>
                <Progress value={trayInfo.occupiedPercent} className="h-1.5 flex-1" />
                <span className="font-bold">{trayInfo.occupiedPercent.toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-xs">Loading...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
