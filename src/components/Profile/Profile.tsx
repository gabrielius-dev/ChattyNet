import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../app/firebase/firebase";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { formatNumber, getUserInfo } from "../../app/helperFunctions";
import CircularProgressComponent from "../CircularProgress";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { LIGHT_GRAY_COLOR } from "../../styles/colors";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { showEditProfileForm } from "../../app/features/UISlice";
import EditProfileForm from "./EditProfileForm";
import { setUserProfileDetails } from "../../app/features/profileSlice";

export default function Profile() {
  // TODO: think about how the profile should look like if account owner checks it. Followers list
  const { username } = useParams();
  const [accountExists, setAccountExists] = useState(false);
  const [userUID, setUserUID] = useState("");
  const userDetails = useAppSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [hoveredFollowers, setHoveredFollowers] = useState(false);
  const [hoveredFollowing, setHoveredFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUserUID = useAppSelector((state) => state.user.uid);
  const currentUserUsername = useAppSelector((state) => state.user.username);
  const dispatch = useAppDispatch();
  const isEditProfileFormShowing = useAppSelector(
    (state) => state.UI.isEditProfileFormShowing
  );

  useEffect(() => {
    async function getUsernameExists() {
      if (!username) return;
      const docRef = doc(db, "usernames", username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserUID(docSnap.data()?.uid);
      setAccountExists(docSnap.exists());
    }

    async function getUserDetails() {
      if (userUID) {
        const userInfo = await getUserInfo(userUID);
        const fixedUserInfo = {
          ...userInfo,
          creationDate: userInfo.creationDate.toDate().toDateString(),
        };
        dispatch(setUserProfileDetails(fixedUserInfo));
      }
    }

    Promise.all([getUsernameExists(), getUserDetails()]).then(() => {
      setLoading(false);
    });
  }, [username, userUID, isLoggedIn, dispatch]);

  useEffect(() => {
    if (userDetails) {
      setIsFollowing(userDetails?.followers.includes(currentUserUID));
    }
  }, [userDetails, currentUserUID]);

  async function handleFollow() {
    if (!userDetails) return;
    const docRef = doc(db, "users", userDetails.uid);
    const batch = writeBatch(db);
    if (isFollowing) {
      batch.update(docRef, {
        followers: arrayRemove(currentUserUID),
      });
      batch.update(doc(db, "users", currentUserUID), {
        following: arrayRemove(userDetails.uid),
      });
      dispatch(
        setUserProfileDetails({
          followersCount: userDetails.followersCount - 1,
          followers: userDetails?.followers.filter(
            (follower) => follower !== currentUserUID
          ),
        })
      );
    } else {
      batch.update(docRef, {
        followers: arrayUnion(currentUserUID),
      });
      batch.update(doc(db, "users", currentUserUID), {
        following: arrayUnion(userDetails.uid),
      });
      dispatch(
        setUserProfileDetails({
          followersCount: userDetails.followersCount + 1,
          followers: [...userDetails.followers, currentUserUID],
        })
      );
    }
    await batch.commit();
    setIsFollowing(!isFollowing);
  }

  function openEditProfile() {
    dispatch(showEditProfileForm());
  }

  return (
    <Box
      sx={{
        borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        width: "52vw",
        maxWidth: "1000px",
        boxSizing: "content-box",
      }}
    >
      {!loading ? (
        <Grid container>
          <Grid item container alignItems="center" p={1}>
            <Grid item pr={4}>
              <Tooltip title="Back">
                <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon sx={{ color: "black" }} />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item container direction="column" xs>
              <Grid item>
                <Typography
                  variant="h6"
                  sx={{ wordBreak: "break-all", fontWeight: "bold" }}
                >
                  {accountExists ? userDetails?.fullName : "Profile"}
                </Typography>
              </Grid>
              {accountExists && (
                <Grid item>
                  <Typography sx={{ color: LIGHT_GRAY_COLOR }}>
                    {formatNumber(userDetails?.tweetsCount || 0)} Tweets
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item sx={{ width: "100%", height: "250px", mb: "6px" }}>
            {userDetails?.headerPhotoURL ? (
              <img
                src={userDetails.headerPhotoURL}
                style={{ width: "100%", height: "250px" }}
                alt="Header image"
              />
            ) : (
              <Box
                sx={{
                  backgroundColor: "#CFD9DE",
                  width: "100%",
                  height: "250px",
                }}
              />
            )}
          </Grid>
          <Grid item container sx={{ pr: 2, pl: 2 }}>
            <Grid item sx={{ marginTop: "-80px" }}>
              {userDetails?.photoURL ? (
                <img
                  src={userDetails.photoURL}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    border: "5px solid white",
                  }}
                  alt="Profile picture"
                />
              ) : accountExists ? (
                <Avatar
                  sx={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    border: "5px solid white",
                    fontSize: "50px",
                  }}
                >
                  {userDetails.fullName.length > 0 &&
                    userDetails.fullName[0].toUpperCase()}
                </Avatar>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#F7F9F9",
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    border: "5px solid white",
                  }}
                />
              )}
            </Grid>
            {accountExists &&
              isLoggedIn &&
              currentUserUsername !== username && (
                <Grid item ml="auto">
                  <Button
                    variant="contained"
                    sx={{
                      color: "white",
                      backgroundColor: "black",
                      borderRadius: "20px",
                      textTransform: "none",
                      pr: 2,
                      pl: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.8)",
                      },
                    }}
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </Grid>
              )}
            {accountExists &&
              isLoggedIn &&
              currentUserUsername === username && (
                <Grid item ml="auto">
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      pr: 2,
                      pl: 2,
                    }}
                    onClick={openEditProfile}
                  >
                    Edit Profile
                  </Button>
                </Grid>
              )}
          </Grid>

          {accountExists ? (
            <Grid item container sx={{ pr: 2, pl: 2 }} direction="column">
              <Grid item>
                <Typography
                  variant="h6"
                  sx={{ wordBreak: "break-all", fontWeight: "bold" }}
                >
                  {userDetails?.fullName}
                </Typography>
              </Grid>
              <Grid item>
                <Typography sx={{ color: LIGHT_GRAY_COLOR }}>
                  @{userDetails?.username}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid item sx={{ pr: 2, pl: 2 }}>
              <Typography
                variant="h6"
                sx={{ wordBreak: "break-all", fontWeight: "bold" }}
              >
                @{username}
              </Typography>
            </Grid>
          )}
          {accountExists && (
            <Grid item container sx={{ pr: 2, pl: 2, mt: 1 }} spacing={2}>
              {userDetails?.information && (
                <Grid item>
                  <Typography sx={{ wordBreak: "break-all" }}>
                    {userDetails?.information}
                  </Typography>
                </Grid>
              )}
              <Grid item container alignItems="center" spacing={1}>
                <Grid item>
                  <CalendarMonthOutlinedIcon sx={{ color: LIGHT_GRAY_COLOR }} />
                </Grid>
                <Grid item>
                  <Typography sx={{ color: LIGHT_GRAY_COLOR }}>
                    Joined {userDetails?.creationDate}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container spacing={2}>
                <Grid item>
                  <Link
                    style={{
                      fontWeight: "bold",
                      wordBreak: "break-all",
                      color: "black",
                      textDecoration: hoveredFollowing ? "underline" : "none",
                      cursor: "pointer",
                    }}
                    to="following"
                    onMouseOver={() => setHoveredFollowing(true)}
                    onMouseOut={() => setHoveredFollowing(false)}
                  >
                    <Grid item container spacing={1}>
                      <Grid item>
                        <Typography fontWeight="bold">
                          {userDetails?.followingCount}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography color={LIGHT_GRAY_COLOR}>
                          Following
                        </Typography>
                      </Grid>
                    </Grid>
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    style={{
                      fontWeight: "bold",
                      wordBreak: "break-all",
                      color: "black",
                      textDecoration: hoveredFollowers ? "underline" : "none",
                      cursor: "pointer",
                    }}
                    to="followers"
                    onMouseOver={() => setHoveredFollowers(true)}
                    onMouseOut={() => setHoveredFollowers(false)}
                  >
                    <Grid item container spacing={1}>
                      <Grid item>
                        <Typography fontWeight="bold">
                          {userDetails?.followersCount}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography color={LIGHT_GRAY_COLOR}>
                          Followers
                        </Typography>
                      </Grid>
                    </Grid>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          )}
          {!accountExists && (
            <Grid
              item
              container
              sx={{ margin: 10 }}
              direction="column"
              alignItems="center"
            >
              <Grid item>
                <Typography
                  sx={{ fontWeight: "bold", mb: 1, fontSize: "31px" }}
                >
                  This account doesn't exist
                </Typography>
                <Typography sx={{ color: LIGHT_GRAY_COLOR }}>
                  Try searching for another.
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      ) : (
        <CircularProgressComponent />
      )}
      {isEditProfileFormShowing && userDetails !== null && <EditProfileForm />}
    </Box>
  );
}
