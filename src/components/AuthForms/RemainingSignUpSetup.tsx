import {
  Box,
  Button,
  FormHelperText,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { auth, db } from "../../app/firebase/firebase";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setUser } from "../../app/features/userSlice";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import { useRef, useState } from "react";
import { isUsernameTaken } from "./helperFunctions";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export default function RemainingSignUpSetup() {
  const dispatch = useAppDispatch();
  const initialUsername = useAppSelector((state) => state.user.username);
  const [username, setUsername] = useState(initialUsername);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const userUID = useAppSelector((state) => state.user.uid);

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        dispatch(setUser({ isLoggedIn: false }));
      })
      .catch(() => {
        dispatch(setErrorMessage("Error signing out. Please try again."));
        dispatch(setIsSnackbarOpen(true));
      });
  };

  const submitSetup = async () => {
    if (await isUsernameTaken(username)) {
      setFormErrorMessage("Username is already taken");
      usernameRef.current?.focus();
      return;
    }

    await Promise.all([
      setDoc(doc(db, "usernames", username), { username }),
      updateDoc(doc(db, "users", userUID), {
        username,
        isSignUpSetupFinished: true,
      }),
    ]);
    dispatch(
      setUser({
        username: username,
        isLoggedIn: true,
        isSignUpSetupFinished: true,
      })
    );
  };

  return (
    <Modal open={true}>
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
        <Typography variant="h4" mt={5} mb={3} fontWeight="bold">
          Finish setup
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Is the username correct?</Typography>
          <TextField
            variant="outlined"
            value={username}
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
            inputRef={(input) => {
              usernameRef.current = input;
              if (input) {
                input.focus();
              }
            }}
            inputProps={{ autoFocus: true, maxLength: 30 }}
          />
        </Stack>
        <FormHelperText error>{formErrorMessage}</FormHelperText>
        <Box
          sx={{
            marginTop: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={submitSetup}
            sx={{ width: "90%" }}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            onClick={signOutUser}
            sx={{ width: "90%" }}
          >
            Sign out
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
}
