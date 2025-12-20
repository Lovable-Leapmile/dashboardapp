import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { apiGet, ROBOTMANAGER_BASE, withQuery } from "@/lib/api";
import noRecordsImage from "@/assets/no_records.png";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TaskData {
  task_id: string;
  task_type: string;
  tray_id: string;
  status: string;
  rack_id: string;
  row_id: string;
  slot_id: string;
  station_slot_id: string;
  station_name: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  is_picking_station?: boolean;
}

interface RackInfo {
  rack_id: string;
  rack_name: string;
  index: number;
}

const Completed = () => {
  useAuthSession();
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<TaskData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allRacks, setAllRacks] = useState<RackInfo[]>([]);
  const [pickingStationRackIds, setPickingStationRackIds] = useState<Set<string>>(new Set());
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Determine bottom 2 racks (picking stations)
  const pickingStationRacks = useMemo(() => {
    if (allRacks.length < 2) return allRacks;
    const sorted = [...allRacks].sort((a, b) => b.index - a.index);
    return sorted.slice(0, 2);
  }, [allRacks]);

  const columnDefs: ColDef<TaskData>[] = [
    {
      field: "task_id",
      headerName: "Task ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "task_type",
      headerName: "Task Type",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          {params.value || "N/A"}
        </Badge>
      ),
    },
    {
      field: "rack_id",
      headerName: "Rack",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 80,
      cellRenderer: (params: any) => {
        const isPickingStation = pickingStationRackIds.has(params.value);
        return (
          <div className="flex items-center gap-1">
            <span>{params.value ?? "N/A"}</span>
            {isPickingStation && (
              <Badge className="bg-amber-500 text-white text-[10px] px-1 py-0">PS</Badge>
            )}
          </div>
        );
      },
    },
    {
      field: "row_id",
      headerName: "Row",
      sortable: true,
      filter: true,
      flex: 0.6,
      minWidth: 60,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "slot_id",
      headerName: "Slot",
      sortable: true,
      filter: true,
      flex: 0.6,
      minWidth: 60,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "tray_id",
      headerName: "Tray ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "station_name",
      headerName: "Station",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "tags",
      headerName: "Tags",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return params.value.join(", ");
      },
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      sortable: true,
      filter: true,
      flex: 1.2,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      },
    },
    {
      field: "created_at",
      headerName: "Created At",
      sortable: true,
      filter: true,
      flex: 1.2,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      },
    },
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchData();
  }, [navigate]);

  // Update picking station rack IDs when racks change
  useEffect(() => {
    const ids = new Set(pickingStationRacks.map((r) => r.rack_id));
    setPickingStationRackIds(ids);
  }, [pickingStationRacks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks and racks in parallel
      const [tasksResult, racksResult] = await Promise.all([
        fetchTasksData(),
        fetchRacksData(),
      ]);

      if (racksResult) {
        setAllRacks(racksResult);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksData = async () => {
    try {
      const url = withQuery(`${ROBOTMANAGER_BASE}/task`, {
        task_status: "completed",
        order_by_field: "updated_at",
        order_by_type: "DESC",
      });

      const { res, data } = await apiGet(url);

      // Handle "no records found" as a normal case
      if (res.status === 404 && data.message === "no records found") {
        console.log("No completed tasks found");
        setTotalCount(0);
        setRowData([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch tasks data");
      }

      console.log("Fetched completed tasks:", data?.records?.length);
      setTotalCount(data.count || 0);
      
      const mapped = (data.records || []).map((r: any) => ({
        task_id: r.task_id || r.id || "N/A",
        task_type: r.task_type || r.type || "N/A",
        tray_id: r.tray_id,
        status: r.status,
        rack_id: r.rack_id || r.rack,
        row_id: r.row_id || r.row,
        slot_id: r.slot_id || r.slot,
        station_slot_id: r.station_slot_id,
        station_name: r.station_name,
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
            ? r.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      
      setRowData(mapped);
    } catch (error: any) {
      if (error.message === "AUTH_TOKEN_MISSING") {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setError("Failed to load tasks data");
      toast({
        title: "Error",
        description: "Failed to load tasks data",
        variant: "destructive",
      });
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchRacksData = async (): Promise<RackInfo[] | null> => {
    try {
      const { res, data } = await apiGet(`${ROBOTMANAGER_BASE}/robots`);

      if (!res.ok) return null;

      const robot = data.records?.[0];
      if (!robot) return null;

      const numRacks = robot.robot_num_racks || 0;
      const racks: RackInfo[] = [];
      
      for (let i = 0; i < numRacks; i++) {
        racks.push({
          rack_id: String(i + 1),
          rack_name: `Rack ${i + 1}`,
          index: i,
        });
      }
      
      return racks;
    } catch (error) {
      console.error("Error fetching racks:", error);
      return null;
    }
  };

  // Get row class for picking station tasks
  const getRowClass = (params: any) => {
    if (pickingStationRackIds.has(params.data?.rack_id)) {
      return "picking-station-row";
    }
    return "";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="" isTasksPage={true} activeTaskTab="Completed" />

      <main className="p-2 sm:p-4">
        {/* Picking Station Visual Indicator */}
        {pickingStationRacks.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-amber-800">Picking Stations:</span>
                {pickingStationRacks.map((rack) => (
                  <Badge 
                    key={rack.rack_id} 
                    className="bg-amber-500 text-white font-bold"
                  >
                    Rack {rack.rack_id}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-amber-600">(Bottom 2 racks)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge className="bg-amber-500 text-white text-[10px] px-1">PS</Badge>
              <span>= Picking Station task</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 220px)" }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading completed tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 220px)" }}>
            <p className="text-destructive">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 220px)" }}>
            <img src={noRecordsImage} alt="No Record found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <>
            <div className="mb-2 text-sm text-muted-foreground">
              Total: <span className="font-semibold">{totalCount}</span> completed tasks
            </div>
            <div className="ag-theme-quartz w-full" style={{ height: "calc(100vh - 200px)" }}>
              <style>{`
                .picking-station-row {
                  background-color: rgba(251, 191, 36, 0.1) !important;
                }
                .picking-station-row:hover {
                  background-color: rgba(251, 191, 36, 0.2) !important;
                }
              `}</style>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{
                  resizable: true,
                  minWidth: 60,
                  sortable: true,
                  filter: true,
                }}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[25, 50, 100, 200]}
                rowHeight={35}
                headerHeight={35}
                getRowClass={getRowClass}
                onGridReady={(params) => {
                  gridApiRef.current = params.api;
                  params.api.sizeColumnsToFit();
                }}
                onGridSizeChanged={(params) => {
                  params.api.sizeColumnsToFit();
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Completed;
