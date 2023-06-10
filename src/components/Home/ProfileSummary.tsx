import { Avatar, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LIGHT_GRAY_COLOR } from "../../styles/colors";

interface ProfileSummaryArguments {
  photoURL: string | null;
  fullName: string;
  username: string;
  information: string;
  following: number;
  followers: number;
}

export default function ProfileSummary({
  photoURL,
  fullName,
  username,
  information,
  following,
  followers,
}: ProfileSummaryArguments) {
  const [hovered, setHovered] = useState(false);
  return (
    <Paper elevation={1} sx={{ p: 1, borderRadius: "15px" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Link
            to={username}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Avatar src={photoURL ?? undefined} sx={{ cursor: "pointer" }}>
              {!photoURL && username[0].toUpperCase()}
            </Avatar>
          </Link>
        </Grid>
        <Grid item container>
          <Grid item xs={12}>
            <Link
              style={{
                fontWeight: "bold",
                wordBreak: "break-all",
                color: "black",
                textDecoration: hovered ? "underline" : "none",
                cursor: "pointer",
              }}
              to={username}
              onMouseOver={() => setHovered(true)}
              onMouseOut={() => setHovered(false)}
            >
              {fullName}
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Link
              style={{
                wordBreak: "break-all",
                textDecoration: "none",
                cursor: "pointer",
                color: LIGHT_GRAY_COLOR,
              }}
              to={username}
            >
              @{username}
            </Link>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography>{information}</Typography>
        </Grid>
        <Grid item container xs={12}>
          <Grid item container spacing={1} xs={6}>
            <Grid item>
              <Typography fontWeight="bold">{following}</Typography>
            </Grid>
            <Grid item>
              <Typography color={LIGHT_GRAY_COLOR}>Following</Typography>
            </Grid>
          </Grid>
          <Grid item container spacing={1} xs={6}>
            <Grid item>
              <Typography fontWeight="bold">{followers}</Typography>
            </Grid>
            <Grid item>
              <Typography color={LIGHT_GRAY_COLOR}>Followers</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
