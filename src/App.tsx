import { Alert, Box, Snackbar } from "@mui/material";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import useLocationListener from "./app/functions/historyListener";
import { useEffect, useState, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./app/firebase/firebase";
import { setUser } from "./app/features/userSlice";
import CircularProgressComponent from "./components/CircularProgress";
import {
  hideLoginReminder,
  setIsSnackbarOpen,
  showLoginReminder,
} from "./app/features/UISlice";
import { doc, getDoc } from "firebase/firestore";
import RemainingSignUpSetup from "./components/AuthForms/RemainingSignUpSetup";
import Followers from "./components/Profile/Followers";
import Following from "./components/Profile/Following";
import NotFound from "./components/NotFound";

const Home = lazy(() => import("./components/Home/Home"));
const Notifications = lazy(
  () => import("./components/Notifications/Notifications")
);
const Messages = lazy(() => import("./components/Messages/Messages"));
const Bookmarks = lazy(() => import("./components/Bookmarks/Bookmarks"));
const Profile = lazy(() => import("./components/Profile/Profile"));
const LogInForm = lazy(() => import("./components/AuthForms/LogInForm"));
const SignUpForm = lazy(() => import("./components/AuthForms/SignUpForm"));
const LoginReminder = lazy(() => import("./components/LoginReminder"));

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const isLogInFormShowing = useAppSelector(
    (state) => state.UI.isLogInFormShowing
  );
  const isSignUpFormShowing = useAppSelector(
    (state) => state.UI.isSignUpFormShowing
  );
  const isSnackbarOpen = useAppSelector((state) => state.UI.isSnackbarOpen);
  const errorMessage = useAppSelector((state) => state.UI.errorMessage);
  const isLoginReminderShowing = useAppSelector(
    (state) => state.UI.isLoginReminderShowing
  );
  const isSignUpSetupFinished = useAppSelector(
    (state) => state.user.isSignUpSetupFinished
  );
  const isAuthenticating = useAppSelector(
    (state) => state.user.isAuthenticating
  );
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
      if (user && !isAuthenticating) {
        const docRef = doc(db, "users", user.uid);
        // Get the document
        const documentSnapshot = await getDoc(docRef);

        // Access a specific field value
        const isSignUpSetupFinished = documentSnapshot.get(
          "isSignUpSetupFinished"
        );

        const photoURL = documentSnapshot.get("photoURL");

        setUserExists(true);
        const username = documentSnapshot.get("username");
        const fullName = documentSnapshot.get("fullName");
        const information = documentSnapshot.get("information");
        const followersCount = documentSnapshot.get("followers").length;
        const followers = documentSnapshot.get("followers");
        const followingCount = documentSnapshot.get("following").length;
        const bookmarks = documentSnapshot.get("bookmarks");
        dispatch(
          setUser({
            fullName,
            username,
            uid: user.uid,
            email: user.email,
            isSignUpSetupFinished,
            photoURL,
            information,
            followers,
            followersCount,
            followingCount,
            bookmarks,
          })
        );
        if (isSignUpSetupFinished) {
          dispatch(setUser({ isLoggedIn: true }));
          dispatch(hideLoginReminder());
        }
      } else {
        dispatch(setUser({ isLoggedIn: false }));
        dispatch(showLoginReminder());
        setUserExists(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, isSignUpSetupFinished, isAuthenticating]);

  useLocationListener();

  if (loading) return <CircularProgressComponent />;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Suspense fallback={<CircularProgressComponent />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route
            path="/:username"
            element={<Profile key={window.location.pathname} />}
          />
          <Route path="/:username/followers" element={<Followers />} />
          <Route path="/:username/following" element={<Following />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {isLogInFormShowing && <LogInForm />}
        {isSignUpFormShowing && <SignUpForm />}
        {isLoginReminderShowing && <LoginReminder />}
        {!isSignUpSetupFinished && userExists && <RemainingSignUpSetup />}
      </Suspense>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => dispatch(setIsSnackbarOpen(false))}
      >
        <Alert
          onClose={() => dispatch(setIsSnackbarOpen(false))}
          severity="error"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
