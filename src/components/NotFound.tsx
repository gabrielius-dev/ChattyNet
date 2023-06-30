import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { LIGHT_GRAY_COLOR } from "../styles/colors";
import { useEffect, useState } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        width: "52vw",
        maxWidth: "1000px",
        boxSizing: "content-box",
      }}
    >
      <Grid container>
        <Grid
          item
          container
          sx={{
            alignItems: "center",
            p: 1,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Grid item pr={4}>
            <Tooltip title="Back">
              <IconButton onClick={() => navigate(-1)}>
                <ArrowBackIcon sx={{ color: "black" }} />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Typography
              variant="h6"
              sx={{ wordBreak: "break-all", fontWeight: "bold" }}
            >
              Page not found
            </Typography>
          </Grid>
        </Grid>
        <Grid
          item
          container
          sx={{
            margin: 10,
            alignItems: "center",
          }}
          direction="column"
        >
          <Grid item>
            <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "31px" }}>
              This page doesn't exist
            </Typography>
            <Typography sx={{ color: LIGHT_GRAY_COLOR }}>
              Redirecting to home page in {seconds} seconds.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
