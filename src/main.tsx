import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/*
 * NOTE: StrictMode is intentionally not enabled — it double-invokes effects
 * in development, which is fine for pure React but wasteful for the WebGL
 * scenes and Web-Audio graph that mount here. The rest of the code is
 * effect-clean; this simply avoids two hero canvases being spun up back to
 * back on dev refreshes.
 */
createRoot(document.getElementById("root")!).render(<App />);
