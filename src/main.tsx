import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTrustedTypes } from "./lib/trustedTypes";

// Initialize Trusted Types policy before rendering to handle CSP requirements
initTrustedTypes();

createRoot(document.getElementById("root")!).render(<App />);
