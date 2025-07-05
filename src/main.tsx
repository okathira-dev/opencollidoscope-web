import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import theme from "./theme";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* MUIのCSSリセット */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
