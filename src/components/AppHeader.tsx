import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut } from "lucide-react";
import whiteLogo from "@/assets/white_logo.png";
import { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import noRecordsImage from "@/assets/no_records.png";

ModuleRegistry.registerModules([AllCommunityModule]);
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogData {
  created_at: string;
  message: any;
  station_slot_id: string;
  station_name: string;
  tray_id: string;
  slot_id: string;
  state: string;
}

interface AppHeaderProps {
  selectedTab: string;
  isTasksPage?: boolean;
  activeTaskTab?: string;
  isMonitorPage?: boolean;
  isCameraPage?: boolean;
  isReportsPage?: boolean;
}

const AppHeader = ({ selectedTab, isTasksPage, activeTaskTab, isMonitorPage, isCameraPage, isReportsPage }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [logsData, setLogsData] = useState<LogData[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const gridApiRef = useRef<any>(null);
  const { toast } = useToast();

  const columnDefs: ColDef<LogData>[] = [
    { 
      field: "created_at", 
      headerName: "Created At", 
      sortable: true, 
      filter: true, 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      }
    },
    { 
      field: "message", 
      headerName: "Message", 
      sortable: true, 
      filter: true, 
      flex: 2,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        let messageStr = typeof params.value === "object" ? JSON.stringify(params.value) : String(params.value);
        const newlineIndex = messageStr.indexOf("\\n");
        if (newlineIndex !== -1) {
          messageStr = messageStr.substring(0, newlineIndex);
        }
        return messageStr;
      }
    },
    { 
      field: "station_slot_id", 
      headerName: "Action", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_name", 
      headerName: "Status", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "slot_id", 
      headerName: "Slot ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "state", 
      headerName: "State", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    }
  ];

  const fetchLogsData = async () => {
    try {
      setLogsLoading(true);
      const response = await fetch("https://amsstores1.leapmile.com/pubsub/subscribe?topic=amsstores1_AMSSTORES1-Nano", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.status === 404 && data.message === "no records found") {
        setLogsData([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch logs data");
      }

      setLogsData(data.records || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load logs data",
        variant: "destructive"
      });
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLogsClick = () => {
    setShowLogsDialog(true);
    fetchLogsData();
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleTabClick = (tab: string) => {
    const routes: { [key: string]: string } = {
      "Robot": "/home",
      "Racks": "/racks",
      "Trays": "/trays",
      "Slots": "/slots",
      "Station": "/station",
      "Extremes": "/extremes",
      "APK Link": "/apk-link"
    };
    if (routes[tab]) {
      navigate(routes[tab]);
    }
  };

  return (
    <>
      <header 
        className="flex items-center justify-between px-4"
        style={{ backgroundColor: '#351C75', height: '55px' }}
      >
        <div className="flex items-center gap-[10px]">
          <div 
            className="rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(53, 28, 117, 0.20)', padding: '15px' }}
          >
            <img src={whiteLogo} alt="Logo" style={{ width: '75px' }} />
          </div>
          <nav className="flex items-center gap-[15px]">
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${selectedTab && !isTasksPage ? 'font-semibold' : ''}`} 
              style={{ color: selectedTab && !isTasksPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/home")}
            >
              Configuration
            </span>
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${isTasksPage ? 'font-semibold' : ''}`} 
              style={{ color: isTasksPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/tasks")}
            >
              Tasks
            </span>
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${isCameraPage ? 'font-semibold' : ''}`} 
              style={{ color: isCameraPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/camera")}
            >
              Camera
            </span>
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${isReportsPage ? 'font-semibold' : ''}`} 
              style={{ color: isReportsPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/reports")}
            >
              Reports
            </span>
          </nav>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-[10px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
                  onClick={handleLogsClick}
                >
                  <ScrollText className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logs</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ 
                    backgroundColor: isMonitorPage ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.20)', 
                    width: '40px', 
                    height: '40px',
                    boxShadow: isMonitorPage ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
                  onClick={() => navigate("/monitor")}
                >
                  <Activity className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Monitor</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
                  onClick={handleLogoutClick}
                >
                  <LogOut className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>

      {selectedTab && !isTasksPage && !isCameraPage && !isReportsPage && (
        <nav 
          className="flex items-center px-6 gap-[8px] border-b border-gray-200"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Robot")}
        >
          Robot
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Robot" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Racks")}
        >
          Racks
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Racks" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Trays")}
        >
          Trays
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Trays" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Slots")}
        >
          Slots
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Slots" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Station")}
        >
          Station
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Station" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Extremes")}
        >
          Extremes
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Extremes" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("APK Link")}
        >
          APK Link
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "APK Link" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
      </nav>
      )}

      {isTasksPage && (
        <nav 
          className="flex items-center px-6 gap-[8px] border-b border-gray-200"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
          {["Pending", "Tray Ready", "Inprogress", "Completed"].map((tab) => (
            <span
              key={tab}
              className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group"
              style={{ color: '#555' }}
              onClick={() => {
                if (tab === "Pending") navigate("/pending");
                if (tab === "Tray Ready") navigate("/tray-ready");
                if (tab === "Inprogress") navigate("/inprogress");
                if (tab === "Completed") navigate("/completed");
              }}
            >
              {tab}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  activeTaskTab === tab ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
          ))}
        </nav>
      )}

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Logs</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {logsLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading logs...</p>
              </div>
            ) : logsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img 
                  src={noRecordsImage} 
                  alt="No Record found" 
                  style={{ width: '340px' }}
                />
              </div>
            ) : (
              <div className="ag-theme-quartz w-full h-[70vh]">
                <AgGridReact
                  rowData={logsData}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    minWidth: 100,
                    sortable: true,
                    filter: true
                  }}
                  pagination={true}
                  paginationPageSize={50}
                  onGridReady={(params) => {
                    gridApiRef.current = params.api;
                    params.api.sizeColumnsToFit();
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppHeader;
