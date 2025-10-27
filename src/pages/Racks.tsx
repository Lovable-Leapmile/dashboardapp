import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut } from "lucide-react";
import whiteLogo from "@/assets/white_logo.png";

const Racks = () => {
  const [userName, setUserName] = useState("");
  const [selectedTab, setSelectedTab] = useState("Racks");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    const routes: { [key: string]: string } = {
      "Robot": "/home",
      "Racks": "/racks",
      "Trays": "/home",
      "Slots": "/home",
      "Station": "/home",
      "Extremes": "/home",
      "APK Link": "/home"
    };
    if (routes[tab]) {
      navigate(routes[tab]);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
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
          <nav className="flex items-center gap-[10px]">
            <span className={`text-base cursor-pointer hover:opacity-80 ${selectedTab ? 'font-semibold' : ''}`} style={{ color: selectedTab ? 'white' : '#80ffffff' }}>Configuration</span>
            <span className="text-base cursor-pointer hover:opacity-80" style={{ color: '#80ffffff' }}>Tasks</span>
            <span className="text-base cursor-pointer hover:opacity-80" style={{ color: '#80ffffff' }}>Camera</span>
            <span className="text-base cursor-pointer hover:opacity-80" style={{ color: '#80ffffff' }}>Reports</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-[10px]">
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
          >
            <ScrollText className="text-white" size={18} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
          >
            <Activity className="text-white" size={18} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
            onClick={handleLogout}
          >
            <LogOut className="text-white" size={18} />
          </div>
        </div>
      </header>

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

      <main className="p-6">
        <h1 className="text-2xl font-bold" style={{ color: '#351C75' }}>Racks Management</h1>
      </main>
    </div>
  );
};

export default Racks;
