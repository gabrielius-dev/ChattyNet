import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

const CircularProgressComponent = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999, // Adjust this value if needed
      }}
    >
      <CircularProgress size={100} />
    </div>
  );
};
export default CircularProgressComponent;
