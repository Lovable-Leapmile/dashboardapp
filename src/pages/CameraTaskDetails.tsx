import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Play, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CameraEvent {
  task_id: string;
  clip_start_time: string;
  clip_stop_time: string;
  clip_filename: string;
  camera_device_id: string;
  clip_url: string;
}

const CameraTaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<CameraEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchCameraEvents(taskId);
    }
  }, [taskId]);

  const fetchCameraEvents = async (task_id: string) => {
    try {
      const response = await fetch(
        `https://amsstores1.leapmile.com/cameramanager/camera_events?clip_status=ready&task_id=${task_id}`,
        {
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.records) {
        setEvents(data.records);
      }
    } catch (error) {
      console.error("Error fetching camera events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = (event: CameraEvent) => {
    setSelectedVideo(event);
    setIsDialogOpen(true);
  };

  const handleDownloadClick = (clipUrl: string) => {
    window.open(clipUrl, "_blank");
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Task ID",
      field: "task_id",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Start Time",
      field: "clip_start_time",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "Stop Time",
      field: "clip_stop_time",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "File Name",
      field: "clip_filename",
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: "Camera Name",
      field: "camera_device_id",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "View",
      field: "view",
      width: 100,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handlePlayClick(params.data)}
          className="flex items-center justify-center w-full h-full text-primary hover:text-primary/80 transition-colors"
        >
          <Play className="h-5 w-5" />
        </button>
      ),
    },
    {
      headerName: "Download",
      field: "download",
      width: 120,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handleDownloadClick(params.data.clip_url)}
          className="flex items-center justify-center w-full h-full text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="h-5 w-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isCameraPage={true} />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/camera")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Task: {taskId}
            </h1>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading camera events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No camera events found for this task
            </div>
          ) : (
            <div className="ag-theme-alpine w-full" style={{ height: "600px" }}>
              <AgGridReact
                rowData={events}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                }}
                pagination={true}
                paginationPageSize={20}
                domLayout="normal"
              />
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedVideo?.camera_device_id}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <video
                controls
                className="w-full rounded-lg"
                src={selectedVideo.clip_url}
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-muted-foreground text-center">
                {selectedVideo.clip_filename}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CameraTaskDetails;
