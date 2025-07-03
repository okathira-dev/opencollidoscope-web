import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import OpenCollidoscopeApp from "./App.tsx";

// MUIのテーマを作成
const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OpenCollidoscopeApp />
    </ThemeProvider>
  </StrictMode>,
);
