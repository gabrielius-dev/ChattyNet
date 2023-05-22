import { useMemo, useCallback } from "react";
import {
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const photoURL = useAppSelector((state) => state.user.photoURL);
  const username = useAppSelector((state) => state.user.username);
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
          icon: (
            <Avatar
              src={photoURL}
              sx={{ height: 36, width: 36, marginLeft: "-5px" }}
            >
              {!photoURL && username[0].toUpperCase()}
            </Avatar>
          ),
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
  }, [isLoggedIn, photoURL, username]);

  const getColor = (label: string) =>
    currentLocation === label.toLowerCase() ? LIGHT_BLUE_COLOR : "black";

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

  return (
    <>
      <Drawer
        sx={{
          position: "sticky",
          top: 0,
          minWidth: "fit-content",
          width: "15vw",
          "& .MuiDrawer-paper": {
            paddingTop: "5vh",
            position: "relative",
            boxSizing: "border-box",
            borderRight: "none",
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
    </>
  );
}
