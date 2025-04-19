import { Box, Typography, Container } from "@mui/material";

export function App() {
  return (
    <Container sx={{ position: "relative" }}>
      <Typography variant="h1" sx={{ fontSize: "2rem", mt: 3, mb: 3 }}>
        Open Collidoscope Web App
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}></Box>
    </Container>
  );
}
