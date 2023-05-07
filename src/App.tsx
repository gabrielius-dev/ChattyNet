import { Alert, Box, Snackbar } from "@mui/material";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import useLocationListener from "./app/functions/historyListener";
import { useEffect, useState, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./app/firebase/firebase";
import { setUser } from "./app/features/userSlice";
import CircularProgressComponent from "./components/CircularProgress";
import { setIsSnackbarOpen } from "./app/features/UISlice";

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
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [loading, setLoading] = useState(true);
  const isLogInFormShowing = useAppSelector(
    (state) => state.UI.isLogInFormShowing
  );
  const isSignUpFormShowing = useAppSelector(
    (state) => state.UI.isSignUpFormShowing
  );
  const isSnackbarOpen = useAppSelector((state) => state.UI.isSnackbarOpen);
  const errorMessage = useAppSelector((state) => state.UI.errorMessage);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        dispatch(
          setUser({ uid: user.uid, email: user.email, isLoggedIn: true })
        );
      } else dispatch(setUser({ isLoggedIn: false }));
    });

    return () => unsubscribe();
  }, [dispatch]);

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
          <Route path="/profile" element={<Profile />} />
        </Routes>
        {isLogInFormShowing && <LogInForm />}
        {isSignUpFormShowing && <SignUpForm />}
        {!isLoggedIn && <LoginReminder />}
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
