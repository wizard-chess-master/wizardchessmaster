import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './lib/debug-admin'; // Load admin debug utilities

createRoot(document.getElementById("root")!).render(<App />);
