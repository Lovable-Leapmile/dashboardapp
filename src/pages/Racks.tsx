import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const Racks = () => {
  const [userName, setUserName] = useState("");
  const [numRacks, setNumRacks] = useState(0);
  const [selectedRack, setSelectedRack] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    
    // Load selected rack from localStorage
    const storedSelectedRack = localStorage.getItem("selected_rack");
    if (storedSelectedRack !== null) {
      setSelectedRack(parseInt(storedSelectedRack));
    }
    
    fetchRobotConfig();
  }, [navigate]);

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
      
      // Store robot configuration globally
      if (data.records && data.records.length > 0) {
        const robotConfig = data.records[0];
        const numRacksValue = robotConfig.robot_num_racks || 0;
        
        localStorage.setItem("robot_num_rows", robotConfig.robot_num_rows?.toString() || "0");
        localStorage.setItem("robot_num_racks", numRacksValue.toString());
        localStorage.setItem("robot_num_slots", robotConfig.robot_num_slots?.toString() || "0");
        localStorage.setItem("robot_num_depths", robotConfig.robot_num_depths?.toString() || "0");
        
        setNumRacks(numRacksValue);
        
        console.log("Robot configuration stored globally:", {
          robot_num_rows: robotConfig.robot_num_rows,
          robot_num_racks: numRacksValue,
          robot_num_slots: robotConfig.robot_num_slots,
          robot_num_depths: robotConfig.robot_num_depths
        });
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  const handleRackSelect = (index: number) => {
    setSelectedRack(index);
    localStorage.setItem("selected_rack", index.toString());
    console.log("Selected rack:", index);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Racks" />
      
      <div style={{ height: '10px' }} />
      
      <main className="p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,40px))] gap-3 justify-center">
          {Array.from({ length: numRacks }, (_, index) => (
            <div
              key={index}
              onClick={() => handleRackSelect(index)}
              className="flex items-center justify-center font-medium text-sm transition-all hover:scale-105 cursor-pointer"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: selectedRack === index ? '#ffffff' : '#351C75',
                color: selectedRack === index ? '#351C75' : 'white',
                borderRadius: '4px',
                border: selectedRack === index ? '2px solid #351C75' : 'none',
                boxShadow: selectedRack === index 
                  ? '0 4px 12px rgba(53, 28, 117, 0.3)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              {index}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <div className="flex flex-col items-center">
            <div 
              className="font-medium text-lg px-6 py-3 rounded-lg"
              style={{
                backgroundColor: '#351C75',
                color: 'white'
              }}
            >
              Row 0
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="font-medium text-lg px-6 py-3 rounded-lg"
              style={{
                backgroundColor: '#351C75',
                color: 'white'
              }}
            >
              Row 1
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Racks;
