import { useMemo, useCallback, useState } from "react";
import {
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@mui/material";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import BookmarksOutlined from "@mui/icons-material/BookmarksOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";
import { signOut } from "firebase/auth";
import { auth } from "../../app/firebase/firebase";
import { setUser } from "../../app/features/userSlice";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  let currentLocation = useAppSelector(
    (state) => state.location.location
  ).slice(1);
  if (currentLocation === "") currentLocation = "home";
  const navigate = useNavigate();

  const handleNavigation = useCallback(
    (route: string) => {
      if (route === "home") navigate("/");
      else navigate(route);
    },
    [navigate]
  );

  const data = useMemo(() => {
    if (isLoggedIn) {
      return [
        { label: "Home", icon: <HomeOutlined /> },
        {
          label: "Notifications",
          icon: <NotificationsOutlined />,
        },
        {
          label: "Messages",
          icon: <MailOutlined />,
        },
        {
          label: "Bookmarks",
          icon: <BookmarksOutlined />,
        },
        {
          label: "Profile",
          icon: null,
        },
      ];
    } else {
      return [
        {
          label: "Home",
          icon: <HomeOutlined />,
        },
      ];
    }
  }, [isLoggedIn]);

  const getColor = (label: string) =>
    currentLocation === label.toLowerCase() ? LIGHT_BLUE_COLOR : "black";

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        dispatch(setUser({ isLoggedIn: false }));
      })
      .catch(() => {
        setOpenSnackbar(true);
      });
  };

  return (
    <>
      <Drawer
        sx={{
          position: "relative",
          minWidth: "fit-content",
          width: "15vw",
          "& .MuiDrawer-paper": {
            paddingTop: "5vh",
            position: "relative",
            boxSizing: "border-box",
          },
          height: "100vh",
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          {data.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() =>
                  handleNavigation(
                    item.label[0].toLowerCase() + item.label.slice(1)
                  )
                }
              >
                <ListItemIcon
                  sx={{
                    color: getColor(item.label),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: getColor(item.label),
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {isLoggedIn && (
            <ListItem disablePadding>
              <ListItemButton onClick={signOutUser}>
                <ListItemIcon sx={{ color: "black" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Sign out" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        sx={{}}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          Error signing out. Please try again.
        </Alert>
      </Snackbar>
    </>
  );
}
