import { Box } from "@mui/material";
import Home from "./components/Home/Home";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Notifications from "./components/Notifications/Notifications";
import Messages from "./components/Messages/Messages";
import Bookmarks from "./components/Bookmarks/Bookmarks";
import Profile from "./components/Profile/Profile";

function App() {
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
    </Box>
  );
}

export default App;
