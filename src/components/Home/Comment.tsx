import { Avatar, Button, Grid, Typography } from "@mui/material";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";
import { CommentComponentArguments } from "../../app/types/postType";
import { useAppDispatch } from "../../app/hooks";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { formatNumber } from "../../app/helperFunctions";

export default function Comment({
  photoURL,
  fullName,
  username,
  date,
  text,
  likes,
  hasLikedComment,
  handleLikeClick,
  commentId,
}: CommentComponentArguments) {
  const dispatch = useAppDispatch();
  function displayError() {
    dispatch(setErrorMessage("You must sign in to like."));
    dispatch(setIsSnackbarOpen(true));
  }

  return (
    <Grid
      container
      spacing={2}
      padding={1}
      sx={{
        width: "52vw",
        maxWidth: "1000px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        marginLeft: 0,
        marginTop: 0,
        padding: 0,
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
      }}
    >
      <Grid item>
        <Avatar src={photoURL ?? undefined}>
          {!photoURL && username[0].toUpperCase()}
        </Avatar>
      </Grid>
      <Grid item xs={12} sm container spacing={0.3}>
        <Grid
          item
          xs
          container
          spacing={1}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Grid item>
            <Typography sx={{ fontWeight: "bold" }}>{fullName}</Typography>
          </Grid>
          <Grid item>
            <Typography color="#adadad">@{username}</Typography>
          </Grid>
          <Grid item>
            <Typography color="#adadad">{date}</Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} container>
          <Grid item>
            <Typography variant="body1" paddingRight={1}>
              {text}
            </Typography>
          </Grid>
        </Grid>
        <Grid item container xs={12}>
          <Grid item>
            <Button
              onClick={
                hasLikedComment !== null
                  ? () => handleLikeClick(commentId)
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
    </Grid>
  );
}
