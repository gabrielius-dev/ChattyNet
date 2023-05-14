import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

const CircularProgressComponent = () => {
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
};
export default CircularProgressComponent;
