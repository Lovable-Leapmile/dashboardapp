import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Task {
  task_id: string;
}

const Camera = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(
        tasks.filter((task) =>
          task.task_id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "https://amsstores1.leapmile.com/cameramanager/camera_events/tasks",
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
        setTasks(data.records);
        setFilteredTasks(data.records);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/camera/${taskId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isCameraPage={true} />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by Task ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No tasks found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => handleTaskClick(task.task_id)}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 flex items-center justify-center"
                  style={{ width: "275px", height: "50px" }}
                >
                  <span className="text-foreground font-medium truncate">
                    {task.task_id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Camera;
