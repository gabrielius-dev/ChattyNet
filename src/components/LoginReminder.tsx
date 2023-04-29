import { Box, Button, Grid, Typography } from "@mui/material";
import { LIGHT_BLUE_COLOR } from "../styles/colors";
import { useAppDispatch } from "../app/hooks";
import { showLogInForm, showSignUpForm } from "../app/features/UISlice";

export default function LoginReminder() {
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        height: "70px",
        position: "fixed",
        bottom: "0%",
        width: "100vw",
        backgroundColor: LIGHT_BLUE_COLOR,
        // That sidebar has z-index:'1200' by default (Material-ui)
        zIndex: "1201",
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="space-evenly"
        alignItems="center"
        pt="8px"
      >
        <Grid item>
          <Grid
            container
            direction="column"
            alignItems="flex-start"
            justifyContent="center"
          >
            <Grid item>
              <Typography
                variant="h4"
                color="white"
                fontWeight="bold"
                fontSize="1.6rem"
              >
                Don't miss what's happening
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="white">
                People on ChattyNet are the first to know.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  border: "1px solid white",
                  borderRadius: "20px",
                  color: "white",
                  textTransform: "none",
                }}
                disableElevation
                onClick={() => dispatch(showLogInForm())}
              >
                Log in
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "white",
                  color: "black",
                  borderRadius: "20px",
                  textTransform: "none",
                  ":hover": {
                    bgcolor: "#D3D3D3",
                    color: "black",
                  },
                }}
                disableElevation
                onClick={() => dispatch(showSignUpForm())}
              >
                Sign up
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
