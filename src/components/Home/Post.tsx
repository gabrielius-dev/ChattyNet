import { Avatar, Button, Grid, Typography } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";

interface PostData {
  photoURL: string | undefined;
  fullName: string;
  username: string;
  date: string;
  text: string;
  likes: number;
  comments: string[];
}

function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
}

export default function Post({
  photoURL,
  fullName,
  username,
  date,
  text,
  likes,
  comments,
}: PostData) {
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
      }}
    >
      <Grid item>
        <Avatar src={photoURL}>{!photoURL && username[0].toUpperCase()}</Avatar>
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
              sx={{
                color: "#808080",
                "&:hover": {
                  backgroundColor: "inherit",
                  color: LIGHT_BLUE_COLOR,
                },
                display: "flex",
                gap: 1,
              }}
            >
              <ChatBubbleOutlineRoundedIcon />
              {formatNumber(comments.length)}
            </Button>
          </Grid>
          <Grid item>
            <Button
              sx={{
                color: "#808080",
                "&:hover": {
                  backgroundColor: "inherit",
                  color: LIGHT_BLUE_COLOR,
                },
                display: "flex",
                gap: 1,
              }}
            >
              <FavoriteBorderRoundedIcon />
              {formatNumber(likes)}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
