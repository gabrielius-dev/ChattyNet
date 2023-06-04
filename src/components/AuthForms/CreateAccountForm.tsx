import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { useRef, useState } from "react";
import { auth } from "../../app/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../app/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { isUsernameTaken } from "./helperFunctions";
import { useAppDispatch } from "../../app/hooks";
import { hideSignUpForm, showLogInForm } from "../../app/features/UISlice";
import { FirebaseError } from "firebase/app";

export default function CreateAccountForm() {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const errorMessages: { [key: string]: string } = {
    "auth/invalid-email": "Invalid email address",
    "auth/email-already-in-use": "Email is already in use",
    "auth/operation-not-allowed": "Operation not allowed",
    "auth/weak-password": "Password is too weak",
    "auth/network-request-failed": "Network request failed",
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate email field
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format");
      emailRef.current?.focus();
      return;
    }

    //Check if username already exists
    if (await isUsernameTaken(username)) {
      setErrorMessage("Username is already taken");
      usernameRef.current?.focus();
      return;
    }

    const fullName = firstName + lastName;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      await Promise.all([
        setDoc(doc(db, "usernames", username), {
          username,
        }),
        setDoc(doc(db, "emails", email), {
          email,
        }),
        setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName,
          username,
          email,
          isSignUpSetupFinished: true,
          likedPosts: [],
          followers: 0,
          following: 0,
          information:''
        }),
      ]);
      dispatch(hideSignUpForm());
    } catch (error: unknown) {
      const errorCode = (error as FirebaseError).code;
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
  };

  return (
    <>
      <Typography variant="h4" mt={5} fontWeight="bold">
        Create account
      </Typography>
      <form
        style={{ width: "100%", padding: "1rem" }}
        onSubmit={(e) => onFormSubmit(e)}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Stack>
          <TextField
            label="Username"
            value={username}
            inputRef={usernameRef}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            type="email"
            label="Email"
            value={email}
            inputRef={emailRef}
            onChange={(e) => setEmail(e.target.value)}
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
            Create account
          </Button>
        </Stack>
      </form>
      <Stack direction="row" mt={4} spacing={1}>
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
