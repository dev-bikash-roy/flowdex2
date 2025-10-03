import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeFavicon } from "./utils/faviconUtils";

// Initialize favicon with FlowdeX logo
initializeFavicon();

createRoot(document.getElementById("root")!).render(<App />);