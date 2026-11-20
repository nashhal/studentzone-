import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import "./styles.css";
import "./premium.css";
import "./clarity-theme.css";
import "./fonts.css";
import "./study-platform-theme.css";
import "./professional-system.css";
import "./interface-refresh.css";
import "./visual-redesign.css";
import "./site-visuals.css";
import "./ui-polish.css";
import "./learning-experience.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider><App /></AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
