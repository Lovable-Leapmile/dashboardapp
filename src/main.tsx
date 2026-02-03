import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTrustedTypes } from "./lib/trustedTypes";
import { applyTheme } from "./lib/theme";

// Initialize Trusted Types policy before rendering to handle CSP requirements
initTrustedTypes();

// Apply the theme based on VITE_DEPLOYMENT_CSS_SKIN environment variable
applyTheme();

createRoot(document.getElementById("root")!).render(<App />);
