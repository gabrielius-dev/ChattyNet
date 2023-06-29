import { Box } from "@mui/material";
import StatusUpdate from "./StatusUpdate";
import Posts from "./Posts";

export default function Home() {
  return (
    <Box
      sx={{
        borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        width: "52vw",
        maxWidth: "1000px",
        boxSizing: "content-box",
        position: "relative",
      }}
    >
      <StatusUpdate />
      <Posts />
    </Box>
  );
}
