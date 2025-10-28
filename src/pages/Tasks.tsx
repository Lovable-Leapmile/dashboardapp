import { useState } from "react";
import AppHeader from "@/components/AppHeader";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  const tabs = ["Pending", "Tray Ready", "Inprogress", "Completed"];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader selectedTab="" />
      
      <div 
        className="flex items-center px-6 gap-[8px] border-b border-gray-200"
        style={{ backgroundColor: '#f9f9f9', height: '50px' }}
      >
        {tabs.map((tab) => (
          <span
            key={tab}
            className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group"
            style={{ color: '#555' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                activeTab === tab ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            ></span>
          </span>
        ))}
      </div>

      <main className="flex-1 p-6">
        <div className="text-gray-700">
          <h2 className="text-xl font-semibold mb-4">{activeTab}</h2>
          {/* Content for each tab will go here */}
        </div>
      </main>
    </div>
  );
};

export default Tasks;
