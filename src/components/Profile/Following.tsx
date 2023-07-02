import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import { getUserInfo, getUsersInfo } from "../../app/helperFunctions";
import { setUserProfileDetails } from "../../app/features/profileSlice";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LIGHT_GRAY_COLOR } from "../../styles/colors";
import UserInformation from "./UserInformation";
import { SmallUserInformationInterface } from "../../app/types/userType";
import CircularProgressComponent from "../CircularProgress";

export default function Following() {
  const { username } = useParams();
  const [accountExists, setAccountExists] = useState(false);
  const [userUID, setUserUID] = useState("");
  const userDetails = useAppSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const [shownFollowingWithInfo, setShownFollowingWithInfo] = useState<
    SmallUserInformationInterface[] | null
  >(null);
  const [moreFollowingExist, setMoreFollowingExist] = useState(false);
  const [lastFollowingPosition, setLastFollowingPosition] = useState(0);

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
    setLoading(true);
    async function setFollowingInfo() {
      const following = userDetails.following;
      if (following.length < 1) return;
      const limitFollowing = following.slice(0, 20);
      const info = await getUsersInfo(limitFollowing);
      setLastFollowingPosition(20);
      setShownFollowingWithInfo(info);
      setLoading(false);
      if (following.length > 20) setMoreFollowingExist(true);
      else setMoreFollowingExist(false);
    }
    setFollowingInfo();
  }, [userDetails.following]);

  const loadMoreFollowing = useCallback(async () => {
    if (!shownFollowingWithInfo) return;
    const following = userDetails.following;
    const limitFollowing = following.slice(
      lastFollowingPosition,
      lastFollowingPosition + 20
    );
    const info = await getUsersInfo(limitFollowing);
    setLastFollowingPosition(lastFollowingPosition + 20);
    setShownFollowingWithInfo([...shownFollowingWithInfo, ...info]);
    if (following.length > lastFollowingPosition + 20)
      setMoreFollowingExist(true);
    else setMoreFollowingExist(false);
  }, [lastFollowingPosition, shownFollowingWithInfo, userDetails.following]);

  useEffect(() => {
    function onScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= scrollableHeight) {
        if (shownFollowingWithInfo && moreFollowingExist) loadMoreFollowing();
      }
    }
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [loadMoreFollowing, moreFollowingExist, shownFollowingWithInfo]);

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
          <Grid
            item
            container
            sx={{
              alignItems: "center",
              p: 1,
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <Grid item pr={4}>
              <Tooltip title="Back">
                <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon sx={{ color: "black" }} />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Typography
                variant="h6"
                sx={{ wordBreak: "break-all", fontWeight: "bold" }}
              >
                {accountExists ? userDetails?.fullName : "Profile"}
              </Typography>
            </Grid>
          </Grid>
          {!accountExists && (
            <Grid
              item
              container
              sx={{
                margin: 10,
                alignItems: "center",
              }}
              direction="column"
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
          {accountExists &&
            shownFollowingWithInfo &&
            shownFollowingWithInfo.length > 0 && (
              <>
                <Grid
                  item
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    p: 1,
                    width: "100%",
                  }}
                >
                  <Typography variant="h3" sx={{ textAlign: "center" }}>
                    Following: {userDetails.followingCount}
                  </Typography>
                </Grid>
                <Grid item container>
                  {shownFollowingWithInfo.map((user) => (
                    <UserInformation {...user} key={user.id} />
                  ))}
                </Grid>
              </>
            )}
          {accountExists &&
            (!shownFollowingWithInfo || shownFollowingWithInfo.length < 1) && (
              <Grid item width="100%">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: "31px",
                    textAlign: "center",
                  }}
                >
                  This account doesn't follow any user
                </Typography>
              </Grid>
            )}
        </Grid>
      ) : (
        <CircularProgressComponent />
      )}
    </Box>
  );
}
