import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { RobotStateTimeline } from "@/components/RobotStateTimeline";
import { DashboardCards } from "@/components/DashboardCards";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [robotNumRacks, setRobotNumRacks] = useState(0);
  const [robotNumSlots, setRobotNumSlots] = useState(0);
  const [robotNumDepths, setRobotNumDepths] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchRobotConfig();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRobotConfig = async () => {
    try {
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robots", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch robot configuration");
      }

      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const robotConfig = data.records[0];
        setRobotNumRacks(robotConfig.robot_num_racks || 0);
        setRobotNumSlots(robotConfig.robot_num_slots || 0);
        setRobotNumDepths(robotConfig.robot_num_depths || 0);
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Robot" />
      
      <main style={{ marginLeft: '15px', paddingTop: '20px', paddingBottom: '20px' }}>
        {/* Header row with all titles */}
        <div className="flex items-center mb-4" style={{ gap: '100px', paddingLeft: '0' }}>
          <div className="text-xl font-semibold" style={{ color: '#351c75', width: '155px', textAlign: 'center' }}>
            Row 1
          </div>
          <div className="text-xl font-semibold" style={{ color: '#351c75', width: '155px', textAlign: 'center' }}>
            Row 0
          </div>
          <div className="flex items-center" style={{ gap: '24px' }}>
            <div className="text-xl font-semibold" style={{ color: '#351c75' }}>
              Robot Status Timeline
            </div>
            <div className="text-sm" style={{ color: '#9ca3af' }}>
              {currentTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </div>
          </div>
        </div>

        {/* Content row */}
        <div className="flex" style={{ gap: '100px' }}>
          {/* Row 1 */}
          <div className="flex flex-col items-center">
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row1-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                    <div
                      key={`row1-depth${depthIdx}-rack${rackIdx}`}
                      className="flex items-center justify-center"
                      style={{
                        width: '75px',
                        height: '25px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        color: '#351c75',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {rackIdx}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Row 0 */}
          <div className="flex flex-col items-center">
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row0-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                    <div
                      key={`row0-depth${depthIdx}-rack${rackIdx}`}
                      className="flex items-center justify-center"
                      style={{
                        width: '75px',
                        height: '25px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        color: '#351c75',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {rackIdx}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Robot State Timeline with Dashboard Cards */}
          <div className="flex flex-col" style={{ flex: 1 }}>
            <RobotStateTimeline />
            <DashboardCards />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
