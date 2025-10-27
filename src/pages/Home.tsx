import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut } from "lucide-react";
import whiteLogo from "@/assets/white_logo.png";

const Home = () => {
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
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
            <span className="text-white text-base cursor-pointer hover:opacity-80">Configuration</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Tasks</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Camera</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Reports</span>
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
        className="flex items-center px-4 gap-[20px]"
        style={{ backgroundColor: '#eeeeee', height: '55px' }}
      >
        <span 
          className="text-base cursor-pointer px-4 py-2 rounded-lg font-medium transition-all"
          style={{ 
            backgroundColor: '#351C75', 
            color: 'white',
            boxShadow: '0 2px 4px rgba(53, 28, 117, 0.2)'
          }}
        >
          Robot
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          Racks
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          Trays
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          Slots
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          Station
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          Extremes
        </span>
        <span className="text-base cursor-pointer hover:bg-white/50 px-4 py-2 rounded-lg transition-all" style={{ color: '#333' }}>
          APK Link
        </span>
      </nav>
    </div>
  );
};

export default Home;
