import { useState, useRef } from "react";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Modal,
  OutlinedInput,
  Paper,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { hideLogInForm, showSignUpForm } from "../../app/features/UISlice";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Stack, Typography, Link, TextField } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../app/firebase/firebase";
import { FirebaseError } from "firebase/app";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleLogInButton from "./GoogleLogInButton";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.UI.isLogInFormShowing);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const errorMessages: { [key: string]: string } = {
    "auth/invalid-email": "Invalid email address",
    "auth/user-disabled": "User account is disabled",
    "auth/user-not-found": "User not found",
    "auth/wrong-password": "Incorrect password",
    "auth/operation-not-allowed": "Operation not allowed",
    "auth/invalid-credential": "Invalid credential",
    "auth/network-request-failed": "Network request failed",
    "auth/too-many-requests": "Too many requests. Wait a minute.",
  };

  async function logInUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate email field
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format");
      emailRef.current?.focus();
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      dispatch(hideLogInForm());
    } catch (error: unknown) {
      const errorCode = (error as FirebaseError).code;
      console.log(errorCode);
      const errorMessage = errorMessages[errorCode] || "Unknown error occurred";
      const isEmailError = errorMessage.toLowerCase().includes("email");
      const isPasswordError = errorMessage.toLowerCase().includes("password");
      if (isEmailError) {
        emailRef.current?.focus();
      } else if (isPasswordError) {
        passwordRef.current?.focus();
      }
      setErrorMessage(errorMessage);
    }
  }

  return (
    <Modal open={open}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "15px",
          width: "500px",
          height: "550px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => dispatch(hideLogInForm())}
          sx={{ position: "absolute", top: 10, left: 10 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" mt={7} mb={5}>
          Sign in to ChattyNet
        </Typography>
        <GoogleLogInButton />
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
        <form onSubmit={(e) => logInUser(e)}>
          <Stack direction="column" spacing={2}>
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              type="email"
              inputRef={emailRef}
              required
            />
            <FormControl variant="outlined" required>
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                ref={passwordRef}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ minLength: 6, maxLength: 32 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <FormHelperText error>{errorMessage}</FormHelperText>
            <Button
              variant="contained"
              type="submit"
              sx={{ borderRadius: "20px" }}
            >
              Log In
            </Button>
          </Stack>
        </form>
        <Stack direction="row" mt={5} spacing={1}>
          <Typography variant="body1">Don't have an account?</Typography>
          <Link
            component="button"
            underline="hover"
            onClick={() => {
              dispatch(hideLogInForm());
              dispatch(showSignUpForm());
            }}
          >
            Sign up
          </Link>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default LoginForm;
