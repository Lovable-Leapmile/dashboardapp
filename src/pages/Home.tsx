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
            <span className="text-white text-sm cursor-pointer hover:opacity-80">Configuration</span>
            <span className="text-white text-sm cursor-pointer hover:opacity-80">Tasks</span>
            <span className="text-white text-sm cursor-pointer hover:opacity-80">Camera</span>
            <span className="text-white text-sm cursor-pointer hover:opacity-80">Reports</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-[10px]">
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(53, 28, 117, 0.20)', padding: '15px' }}
          >
            <ScrollText className="text-white" size={20} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(53, 28, 117, 0.20)', padding: '15px' }}
          >
            <Activity className="text-white" size={20} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(53, 28, 117, 0.20)', padding: '15px' }}
            onClick={handleLogout}
          >
            <LogOut className="text-white" size={20} />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
