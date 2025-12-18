import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Package, ShoppingCart, Archive, Layers, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import noRecordsImage from "@/assets/no_records.png";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AUTH_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

type ReportType = 
  | "product_stock"
  | "order_product_transaction"
  | "order_tray_transaction"
  | "tray_transaction"
  | "rack_transaction"
  | "order_failure_transaction";

interface ReportConfig {
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  columns: ColDef[];
}

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  try {
    return format(new Date(value), "dd-MM-yyyy HH:mm");
  } catch {
    return value;
  }
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  try {
    return format(new Date(value), "dd-MM-yyyy");
  } catch {
    return value;
  }
};

const Reports = () => {
  useAuthSession();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const robotId = searchParams.get("robot_id") || "AMSSTORES1-Nano";

  const [reportType, setReportType] = useState<ReportType>("product_stock");
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [occupiedPercent, setOccupiedPercent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Product Stock Report - /nanostore/items
  const productStockColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "created_at", 
      headerName: "Receive Date", 
      flex: 1, 
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: "item_id", 
      headerName: "Item Id", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_quantity", 
      headerName: "Stock", 
      width: 100,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "item_description", 
      headerName: "Item Description", 
      flex: 2,
      valueFormatter: (params) => params.value ?? "N/A"
    },
  ];

  // Order Product Transaction - /nanostore/items/usage
  const orderProductColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "item_id", 
      headerName: "Item ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_description", 
      headerName: "Item Description", 
      flex: 2,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "usage_count", 
      headerName: "Usage Count", 
      width: 120,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "item_quantity", 
      headerName: "Stock", 
      width: 100,
      valueFormatter: (params) => params.value ?? 0
    },
  ];

  // Order Tray Transaction - /robotmanager/task
  const orderTrayColumns: ColDef[] = [
    { 
      field: "created_at", 
      headerName: "Task Date", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_slot_id", 
      headerName: "Station Slot ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_name", 
      headerName: "Station Name", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tags", 
      headerName: "Tags", 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return Array.isArray(params.value) ? params.value.join(", ") : params.value;
      }
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
  ];

  // Tray Transaction - /robotmanager/trays
  const trayTransactionColumns: ColDef[] = [
    { 
      field: "created_at", 
      headerName: "Created Date", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_status", 
      headerName: "Status", 
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_height", 
      headerName: "Height", 
      width: 100,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_weight", 
      headerName: "Weight (kg)", 
      width: 120, 
      valueFormatter: (params) => params.value ? (params.value / 1000).toFixed(2) : "N/A"
    },
    { 
      field: "tray_divider", 
      headerName: "Divider", 
      width: 100,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_lockcount", 
      headerName: "Lock Count", 
      width: 110,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
  ];

  // Rack Transaction - /robotmanager/slots
  const rackTransactionColumns: ColDef[] = [
    { 
      field: "slot_id", 
      headerName: "Slot ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "slot_name", 
      headerName: "Slot Name", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tags", 
      headerName: "Tags", 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return Array.isArray(params.value) ? params.value.join(", ") : params.value;
      }
    },
    { 
      field: "slot_height", 
      headerName: "Height (mm)", 
      width: 110,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "slot_status", 
      headerName: "Status", 
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
  ];

  // Order Failure Transaction - /robotmanager/task?task_status=failed
  const orderFailureColumns: ColDef[] = [
    { 
      field: "created_at", 
      headerName: "Failure Date", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_slot_id", 
      headerName: "Station Slot ID", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_name", 
      headerName: "Station Name", 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tags", 
      headerName: "Tags", 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return Array.isArray(params.value) ? params.value.join(", ") : params.value;
      }
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
  ];

  const reportConfigs: Record<ReportType, ReportConfig> = useMemo(() => ({
    product_stock: {
      label: "Product Stock Report",
      icon: <Package className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/items",
      columns: productStockColumns,
    },
    order_product_transaction: {
      label: "Order Product Transaction",
      icon: <ShoppingCart className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/items/usage?order_by=DESC",
      columns: orderProductColumns,
    },
    order_tray_transaction: {
      label: "Order Tray Transaction",
      icon: <Archive className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/task",
      columns: orderTrayColumns,
    },
    tray_transaction: {
      label: "Tray Transaction",
      icon: <Layers className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/trays",
      columns: trayTransactionColumns,
    },
    rack_transaction: {
      label: "Rack Transaction",
      icon: <Layers className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/slots",
      columns: rackTransactionColumns,
    },
    order_failure_transaction: {
      label: "Order Failure Transaction",
      icon: <AlertTriangle className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/task?task_status=failed",
      columns: orderFailureColumns,
    },
  }), []);

  const fetchOccupiedPercent = useCallback(async () => {
    try {
      const [slotsResponse, traysResponse] = await Promise.all([
        fetch("https://amsstores1.leapmile.com/robotmanager/slots_count?slot_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        }),
        fetch("https://amsstores1.leapmile.com/robotmanager/trays?tray_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        })
      ]);

      const slotsData = await slotsResponse.json();
      const traysData = await traysResponse.json();

      const totalSlots = slotsData.records?.[0]?.total_count || 0;
      const occupiedSlots = traysData.records ? traysData.records.length : 0;
      const percent = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      setOccupiedPercent(percent);
    } catch (error) {
      console.error("Error fetching occupied percent:", error);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const config = reportConfigs[reportType];
      let url = config.endpoint;
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}num_records=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      
      const response = await fetch(url, {
        headers: { 
          "Authorization": AUTH_TOKEN, 
          "Content-Type": "application/json" 
        }
      });

      if (response.status === 404) {
        setRowData([]);
        setTotalCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRowData(data.records || []);
      setTotalCount(data.total_count || data.count || data.rowcount || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
      console.error("Error fetching report data:", error);
      setRowData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [reportType, currentPage, pageSize, reportConfigs, toast]);

  useEffect(() => {
    fetchOccupiedPercent();
  }, [fetchOccupiedPercent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reportType]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    fetchReportData();
    fetchOccupiedPercent();
  };

  const handleDownload = () => {
    if (rowData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to download",
        variant: "destructive",
      });
      return;
    }

    const config = reportConfigs[reportType];
    const headers = config.columns.map(col => col.headerName).join(",");
    const rows = rowData.map(row => 
      config.columns.map(col => {
        const field = col.field as string;
        let value = row[field];
        if (field === "created_at" || field === "updated_at") {
          value = value ? formatDateTime(value) : "N/A";
        }
        if (field === "tray_weight") {
          value = value ? (value / 1000).toFixed(2) : "N/A";
        }
        if (field === "tags" && Array.isArray(value)) {
          value = value.join(", ");
        }
        return `"${value ?? "N/A"}"`;
      }).join(",")
    ).join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportConfigs[reportType].label.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isReportsPage={true} />
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-foreground">
                  {reportConfigs[reportType].label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Robot ID: <span className="font-medium text-foreground">{robotId}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 px-4 py-2 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Slots Occupied</p>
                  <p className="text-lg font-bold text-primary">{occupiedPercent.toFixed(2)} %</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-sm font-medium text-muted-foreground">Reports:</label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                  <SelectTrigger className="w-[260px] bg-card">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border z-50">
                    {Object.entries(reportConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading || rowData.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Pagination Info - Top */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground px-1">
            <span>
              {totalCount > 0 ? `${startRecord} to ${endRecord} of ${totalCount}` : "No records"}.
              {totalPages > 0 && ` Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm">Page Size:</label>
              <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px] h-8 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : rowData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <img src={noRecordsImage} alt="No Records" className="w-32 h-32 mb-4 opacity-70" />
                <p className="text-lg font-medium">No Data Available</p>
                <p className="text-sm">Try selecting a different report type or refresh the data.</p>
              </div>
            ) : (
              <div className="ag-theme-alpine h-[500px] w-full">
                <AgGridReact
                  rowData={rowData}
                  columnDefs={reportConfigs[reportType].columns}
                  defaultColDef={defaultColDef}
                  animateRows={true}
                  rowSelection="single"
                  suppressCellFocus={true}
                />
              </div>
            )}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1 || loading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || loading}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
