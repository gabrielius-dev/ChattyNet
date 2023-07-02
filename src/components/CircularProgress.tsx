import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

const CircularProgressComponent = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={100} />
    </div>
  );
};
export default CircularProgressComponent;
