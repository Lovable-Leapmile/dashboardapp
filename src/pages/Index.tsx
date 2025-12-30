import { useState, useEffect, useRef } from "react";
import LoginForm from "@/components/LoginForm";
import ApiConfigModal from "@/components/ApiConfigModal";
import backgroundImage from "@/assets/dashboard_login_bg.png";
import { isApiConfigured } from "@/lib/apiConfig";
import { getStoredAuthToken } from "@/lib/auth";

const Index = () => {
  const [showApiModal, setShowApiModal] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only run check once on mount to avoid repeated renders
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check if all auth-related data is missing
    const authToken = getStoredAuthToken();
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("user_name");
    const loginTimestamp = localStorage.getItem("login_timestamp");
    const apiConfigured = isApiConfigured();

    // Check cookies for any auth data
    const cookies = document.cookie;
    const hasAuthCookie = cookies.includes("token") || 
                          cookies.includes("auth") || 
                          cookies.includes("session");

    // If all auth data is missing AND API is not configured, show the modal
    const noAuthData = !authToken && !userId && !userName && !loginTimestamp && !hasAuthCookie;
    
    if (noAuthData && !apiConfigured) {
      setShowApiModal(true);
    }
  }, []);

  const handleApiConfigured = () => {
    setShowApiModal(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* API Config Modal - shown after logout when all auth data is cleared */}
      {showApiModal && <ApiConfigModal onConfigured={handleApiConfigured} />}

      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          width: '100%',
          height: '100vh'
        }}
      />
      
      {/* Semi-transparent Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#351c7526',
          width: '100%',
          height: '100%'
        }}
      />

      {/* Login Form Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-8">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
