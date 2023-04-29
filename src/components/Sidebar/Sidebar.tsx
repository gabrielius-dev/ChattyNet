import { useMemo, useCallback } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  HomeOutlined,
  NotificationsOutlined,
  MailOutlined,
  BookmarksOutlined,
} from "@mui/icons-material";
import { useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";

export default function Sidebar() {
  const isLoggedIn = useAppSelector((state) => state.login.isLoggedIn);
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

  return (
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
      </List>
    </Drawer>
  );
}
