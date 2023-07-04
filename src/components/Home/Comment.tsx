import { Avatar, Button, Grid, Typography, IconButton } from "@mui/material";
import { LIGHT_BLUE_COLOR, LIGHT_GRAY_COLOR } from "../../styles/colors";
import { CommentComponentArguments } from "../../app/types/postType";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { formatNumber } from "../../app/helperFunctions";
import React, { useState } from "react";
import ProfileSummary from "./ProfileSummary";
import { Link } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";

export default function Comment({
  photoURL,
  fullName,
  username,
  createdBy,
  date,
  text,
  likes,
  hasLikedComment,
  handleLikeClick,
  handleDelete,
  commentId,
  information,
  followers,
  following,
}: CommentComponentArguments) {
  const dispatch = useAppDispatch();
  const [showProfileSummary, setShowProfileSummary] = useState(false);
  const [profileSummaryCoords, setProfileSummaryCoords] = useState({
    x: 0,
    y: 0,
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [hovered, setHovered] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const currentUserUID = useAppSelector((state) => state.user.uid);

  function displayError() {
    dispatch(setErrorMessage("You must sign in to like."));
    dispatch(setIsSnackbarOpen(true));
  }

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

  return (
    <Grid
      container
      spacing={2}
      padding={1}
      sx={{
        position: "relative",
        width: "52vw",
        maxWidth: "1000px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        marginLeft: 0,
        marginTop: 0,
        padding: 0,
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
      }}
      onMouseOver={() => setShowCloseButton(createdBy === currentUserUID)}
      onMouseOut={() => {
        if (timer) clearTimeout(timer);
        setShowProfileSummary(false);
        setShowCloseButton(false);
      }}
    >
      <Grid item>
        <Link
          to={`/${username}`}
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
              onMouseOver={() => setHovered(true)}
              onMouseOut={() => setHovered(false)}
            >
              {fullName}
            </Link>
          </Grid>
          <Grid
            item
            onMouseOver={(e) => handleShowProfileSummary(e)}
            onMouseOut={() => {
              if (timer) clearTimeout(timer);
            }}
          >
            <Link
              style={{
                wordBreak: "break-all",
                textDecoration: "none",
                cursor: "pointer",
                color: LIGHT_GRAY_COLOR,
              }}
              to={`/${username}`}
            >
              @{username}
            </Link>
          </Grid>
          <Grid item>
            <Typography color={LIGHT_GRAY_COLOR}>{date}</Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} container>
          <Grid item>
            <Typography
              variant="body1"
              paddingRight={1}
              sx={{ wordBreak: "break-all" }}
            >
              {text}
            </Typography>
          </Grid>
          {showCloseButton && (
            <Grid item marginLeft="auto">
              <IconButton
                sx={{ "&:hover": { color: LIGHT_BLUE_COLOR } }}
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                  handleDelete(e, commentId)
                }
              >
                <ClearIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>
        <Grid item container xs={12}>
          <Grid item>
            <Button
              onClick={
                hasLikedComment !== null
                  ? () => handleLikeClick(commentId, createdBy)
                  : displayError
              }
              sx={{
                color: hasLikedComment ? LIGHT_BLUE_COLOR : "#808080",
                "&:hover": {
                  backgroundColor: "inherit",
                  color: LIGHT_BLUE_COLOR,
                },
                display: "flex",
                gap: 1,
              }}
            >
              {hasLikedComment ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderRoundedIcon />
              )}
              {formatNumber(likes)}
            </Button>
          </Grid>
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
            top: `${profileSummaryCoords.y}px`,
            left: `${profileSummaryCoords.x}px`,
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
