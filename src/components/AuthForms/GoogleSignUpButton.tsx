import GoogleIcon from "../../assets/icons/google.svg";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "../../app/firebase/firebase";
import { Button } from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import {
  hideSignUpForm,
  setErrorMessage,
  setIsSnackbarOpen,
} from "../../app/features/UISlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isUsernameTaken } from "./helperFunctions";
import { setUser } from "../../app/features/userSlice";

const GoogleSignUpButton = () => {
  const dispatch = useAppDispatch();

  async function generateUniqueUsername(fullName: string) {
    let username = fullName.replaceAll(" ", "");
    while (await isUsernameTaken(username)) {
      if (username.length > 30) username = username.substring(0, 26);
      username = `${username}${Math.floor(Math.random() * 9000 + 1000)}`;
    }
    return username;
  }

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();

    try {
      dispatch(setUser({ isAuthenticating: true }));
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email ?? "";
      const docRef = doc(db, "emails", email);
      const documentSnapshot = await getDoc(docRef);
      const userExists = documentSnapshot.exists();

      if (userExists) {
        await signOut(auth);
        dispatch(setUser({ isAuthenticating: false }));
        dispatch(setErrorMessage("Account already exists!"));
        dispatch(setIsSnackbarOpen(true));
      } else {
        const fullName = user.displayName || "";

        const username = await generateUniqueUsername(fullName);
        await Promise.all([
          setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName,
            email,
            username,
            photoURL: user.photoURL,
            isSignUpSetupFinished: false,
            likedPosts: [],
            followers: 0,
            following: 0,
            information: "",
            tweetsCount: 0,
          }),
          setDoc(docRef, { email }),
        ]);
        dispatch(hideSignUpForm());
        dispatch(setUser({ isAuthenticating: false }));
      }
    } catch {
      dispatch(
        setErrorMessage(
          "There was an error while signing up with google. Try again later."
        )
      );
      dispatch(setIsSnackbarOpen(true));
    } finally {
      dispatch(setUser({ isAuthenticating: false }));
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
      onClick={handleGoogleSignUp}
    >
      <img src={GoogleIcon} style={{ width: "1.5rem", height: "1.5rem" }} />
      Sign up with Google
    </Button>
  );
};

export default GoogleSignUpButton;
