import GoogleIcon from "../../assets/icons/google.svg";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../app/firebase/firebase";
import { Button } from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import {
  hideLogInForm,
  setErrorMessage,
  setIsSnackbarOpen,
} from "../../app/features/UISlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isUsernameTaken } from "./helperFunctions";

const GoogleLogInButton = () => {
  const dispatch = useAppDispatch();

  async function generateUniqueUsername(fullName: string) {
    let username = fullName.replaceAll(" ", "");
    while (await isUsernameTaken(username)) {
      username = `${username}${Math.floor(Math.random() * 9000 + 1000)}`;
    }
    return username;
  }

  const handleGoogleLogIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email ?? "";
      const docRef = doc(db, "emails", email);
      const documentSnapshot = await getDoc(docRef);
      const userExists = documentSnapshot.exists();

      if (!userExists) {
        const fullName = user.displayName || "";
        const username = await generateUniqueUsername(fullName);

        await Promise.all([
          setDoc(doc(db, "users", user.uid), {
            fullName,
            email,
            username,
            photoURL: user.photoURL,
            isSignUpSetupFinished: false,
          }),
          setDoc(docRef, { email }),
        ]);
        dispatch(hideLogInForm());
      } else {
        dispatch(hideLogInForm());
      }
    } catch {
      dispatch(
        setErrorMessage(
          "There was an error while signing in with google. Try again later."
        )
      );
      dispatch(setIsSnackbarOpen(true));
    }
  };
  return (
    <Button
      variant="outlined"
      sx={{
        color: "#808080",
        textTransform: "none",
        border: "1px solid #D3D3D3",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        gap: "0.2rem",
        width: "300px",
        "&:hover": {
          border: "1px solid #D3D3D3",
          bgcolor: "white",
        },
      }}
      onClick={handleGoogleLogIn}
    >
      <img src={GoogleIcon} style={{ width: "1.5rem", height: "1.5rem" }} />
      Sign in with Google
    </Button>
  );
};

export default GoogleLogInButton;
