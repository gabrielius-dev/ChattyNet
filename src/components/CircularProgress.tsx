import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { memo } from "react";

const CircularProgressComponent = memo(() => {
  return (
    <CircularProgress
      size={100}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
      }}
    />
  );
});
export default CircularProgressComponent;
