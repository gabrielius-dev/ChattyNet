import { memo, useState } from "react";
import { Avatar, Grid } from "@mui/material";
import { LIGHT_GRAY_COLOR } from "../../styles/colors";
import { Link } from "react-router-dom";
import ProfileSummary from "../Home/ProfileSummary";

const UserInformation = memo(
  ({
    photoURL,
    fullName,
    username,
    information,
    followersCount,
    followingCount,
  }: {
    photoURL: string | null;
    fullName: string;
    username: string;
    information: string;
    followersCount: number;
    followingCount: number;
  }) => {
    const [showProfileSummary, setShowProfileSummary] = useState(false);
    const [profileSummaryCoords, setProfileSummaryCoords] = useState({
      x: 0,
      y: 0,
    });
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [hovered, setHovered] = useState(false);

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
        }}
        // For safety
        onMouseOut={() => {
          if (timer) clearTimeout(timer);
          setShowProfileSummary(false);
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
              followers={followersCount}
              following={followingCount}
            />
          </Grid>
        )}
      </Grid>
    );
  }
);
export default UserInformation;
