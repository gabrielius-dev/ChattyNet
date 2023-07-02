import { Avatar, Grid, Typography, IconButton } from "@mui/material";
import { NotificationComponentArguments } from "../../app/types/notificationType";
import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileSummary from "../Home/ProfileSummary";
import ClearIcon from "@mui/icons-material/Clear";
import { useAppSelector } from "../../app/hooks";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";

const Notification = memo(
  ({
    photoURL,
    notificationId,
    fullName,
    username,
    handleDelete,
    information,
    followers,
    following,
    type,
    elementId,
    date,
  }: NotificationComponentArguments) => {
    const [showProfileSummary, setShowProfileSummary] = useState(false);
    const [profileSummaryCoords, setProfileSummaryCoords] = useState({
      x: 0,
      y: 0,
    });
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [hovered, setHovered] = useState(false);
    const messages = {
      "post/like": "liked your post",
      "post/comment": "commented on your post",
      "post/creation": "created a new post",
      "comment/like": "liked your comment",
      "profile/follow": "started following you",
    };
    const navigate = useNavigate();
    const currentUserUsername = useAppSelector((state) => state.user.username);
    const [showCloseButton, setShowCloseButton] = useState(false);

    function handleShowProfileSummary(
      e: React.MouseEvent<HTMLSpanElement, MouseEvent>
    ) {
      const bounds = (e.target as HTMLSpanElement).getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      setProfileSummaryCoords({ x, y });
      const timer = setTimeout(() => {
        setShowProfileSummary(true);
      }, 1000);
      setTimer(timer);
    }

    function handleLinkClick(
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) {
      e.stopPropagation();
    }

    function handleNavigation() {
      if (elementId === null) {
        navigate(`/${currentUserUsername}`);
        return;
      }
      navigate(`/${username}/posts/${elementId}`);
    }

    return (
      <Grid
        container
        spacing={2}
        onClick={handleNavigation}
        sx={{
          position: "relative",
          width: "52vw",
          maxWidth: "1000px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          marginLeft: 0,
          marginTop: 0,
          padding: 0,
          pb: 1,
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
          cursor: "pointer",
        }}
        onMouseOver={() => setShowCloseButton(true)}
        // For safety
        onMouseOut={() => {
          if (timer) clearTimeout(timer);
          setShowProfileSummary(false);
          setShowCloseButton(false);
        }}
      >
        <Grid item>
          <Link
            to={`/${username}`}
            onClick={handleLinkClick}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Avatar src={photoURL ?? undefined} sx={{ cursor: "pointer" }}>
              {!photoURL && fullName[0].toUpperCase()}
            </Avatar>
          </Link>
        </Grid>
        <Grid item xs={12} sm container spacing={0.3}>
          <Grid
            item
            xs
            container
            spacing={1}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Grid
              item
              onMouseOver={(e) => handleShowProfileSummary(e)}
              onMouseOut={() => {
                if (timer) clearTimeout(timer);
              }}
            >
              <Link
                style={{
                  fontWeight: "bold",
                  wordBreak: "break-all",
                  color: "black",
                  textDecoration: hovered ? "underline" : "none",
                  cursor: "pointer",
                }}
                to={`/${username}`}
                onClick={handleLinkClick}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
              >
                {fullName}
              </Link>
            </Grid>
            <Grid item>
              <Typography>
                {messages[type]} {date}.
              </Typography>
            </Grid>
            {showCloseButton && (
              <Grid item marginLeft="auto">
                <IconButton
                  sx={{ "&:hover": { color: LIGHT_BLUE_COLOR } }}
                  onClick={(e) => handleDelete(e, notificationId)}
                >
                  <ClearIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
        {showProfileSummary && (
          <Grid
            item
            onMouseOver={() => setShowProfileSummary(true)}
            onMouseOut={() => setShowProfileSummary(false)}
            sx={{
              position: "absolute",
              zIndex: 10000,
              width: "280px",
              minHeight: "fit-content",
              top: profileSummaryCoords.y,
              left: profileSummaryCoords.x,
            }}
          >
            <ProfileSummary
              photoURL={photoURL}
              fullName={fullName}
              username={username}
              information={information}
              followers={followers}
              following={following}
            />
          </Grid>
        )}
      </Grid>
    );
  }
);

export default Notification;
