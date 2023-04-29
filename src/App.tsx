import { Box } from "@mui/material";
import Home from "./components/Home/Home";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Notifications from "./components/Notifications/Notifications";
import Messages from "./components/Messages/Messages";
import Bookmarks from "./components/Bookmarks/Bookmarks";
import Profile from "./components/Profile/Profile";
import { useAppSelector } from "./app/hooks";
import LoginReminder from "./components/LoginReminder";
import useLocationListener from "./app/functions/historyListener";
import LogInForm from "./components/AuthForms/LogInForm";
import SignUpForm from "./components/AuthForms/SignUpForm";

function App() {
  const isLoggedIn = useAppSelector((state) => state.login.isLoggedIn);
  const isLogInFormShowing = useAppSelector(
    (state) => state.UI.isLogInFormShowing
  );
  const isSignUpFormShowing = useAppSelector(
    (state) => state.UI.isSignUpFormShowing
  );

  useLocationListener();

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
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
    </Box>
  );
}

export default App;
