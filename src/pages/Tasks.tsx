import { useState } from "react";
import AppHeader from "@/components/AppHeader";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        selectedTab="" 
        isTasksPage={true}
        activeTaskTab={activeTab}
        onTaskTabChange={setActiveTab}
      />

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
