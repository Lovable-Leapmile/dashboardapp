import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const Racks = () => {
  const [userName, setUserName] = useState("");
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
        localStorage.setItem("robot_num_rows", robotConfig.robot_num_rows?.toString() || "0");
        localStorage.setItem("robot_num_racks", robotConfig.robot_num_racks?.toString() || "0");
        localStorage.setItem("robot_num_slots", robotConfig.robot_num_slots?.toString() || "0");
        localStorage.setItem("robot_num_depths", robotConfig.robot_num_depths?.toString() || "0");
        console.log("Robot configuration stored globally:", {
          robot_num_rows: robotConfig.robot_num_rows,
          robot_num_racks: robotConfig.robot_num_racks,
          robot_num_slots: robotConfig.robot_num_slots,
          robot_num_depths: robotConfig.robot_num_depths
        });
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Racks" />
      
      <main className="p-6">
        <h1 className="text-2xl font-bold" style={{ color: '#351C75' }}>Racks Management</h1>
      </main>
    </div>
  );
};

export default Racks;
