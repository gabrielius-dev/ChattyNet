import { Button, Stack, Typography, Link } from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import {
  hideInitialSignUpForm,
  hideSignUpForm,
  showCreateAccountForm,
  showLogInForm,
} from "../../app/features/UISlice";
import GoogleAuthButton from "./GoogleSignUpButton";

export default function InitialSignUpForm() {
  const dispatch = useAppDispatch();

  return (
    <>
      <Typography variant="h4" fontWeight="bold" mt={7} mb={5}>
        Join ChattyNet today
      </Typography>
      <GoogleAuthButton />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
      >
        <span
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#CFCFCF",
            width: "130px",
          }}
        />
        <Typography>or</Typography>
        <span
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#CFCFCF",
            width: "130px",
          }}
        />
      </Stack>
      <Button
        variant="contained"
        sx={{
          color: "white",
          bgcolor: "black",
          textTransform: "none",
          border: "none",
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          gap: "0.2rem",
          width: "300px",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#28282B",
          },
        }}
        onClick={() => {
          dispatch(showCreateAccountForm());
          dispatch(hideInitialSignUpForm());
        }}
      >
        Create account
      </Button>
      <Stack direction="row" mt={5} spacing={1}>
        <Typography variant="body1">Have an account already?</Typography>
        <Link
          component="button"
          underline="hover"
          onClick={() => {
            dispatch(hideSignUpForm());
            dispatch(showLogInForm());
          }}
        >
          Log in
        </Link>
      </Stack>
    </>
  );
}
