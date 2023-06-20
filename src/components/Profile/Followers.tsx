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

export default function Followers() {
  const { username } = useParams();
  const [accountExists, setAccountExists] = useState(false);
  const [userUID, setUserUID] = useState("");
  const userDetails = useAppSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [shownFollowersWithInfo, setShownFollowersWithInfo] = useState<
    SmallUserInformationInterface[] | null
  >(null);
  const [moreFollowersExist, setMoreFollowersExist] = useState(false);
  const [lastFollowersPosition, setLastFollowersPosition] = useState(0);

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
    async function setFollowersInfo() {
      const followers = userDetails.followers;
      if (followers.length < 1) return;
      const limitFollowers = followers.slice(0, 20);
      const info = await getUsersInfo(limitFollowers);
      setLastFollowersPosition(20);
      setShownFollowersWithInfo(info);
      setLoading(false);
      if (followers.length > 20) setMoreFollowersExist(true);
      else setMoreFollowersExist(false);
    }
    setFollowersInfo();
  }, [userDetails.followers]);

  const loadMoreFollowers = useCallback(async () => {
    if (!shownFollowersWithInfo) return;
    const followers = userDetails.followers;
    const limitFollowers = followers.slice(
      lastFollowersPosition,
      lastFollowersPosition + 20
    );
    const info = await getUsersInfo(limitFollowers);
    setLastFollowersPosition(lastFollowersPosition + 20);
    setShownFollowersWithInfo([...shownFollowersWithInfo, ...info]);
    if (followers.length > lastFollowersPosition + 20)
      setMoreFollowersExist(true);
    else setMoreFollowersExist(false);
  }, [lastFollowersPosition, shownFollowersWithInfo, userDetails.followers]);

  useEffect(() => {
    function onScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= scrollableHeight) {
        if (shownFollowersWithInfo && moreFollowersExist) loadMoreFollowers();
      }
    }
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [loadMoreFollowers, moreFollowersExist, shownFollowersWithInfo]);

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
      {!loading && (
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
            shownFollowersWithInfo &&
            shownFollowersWithInfo.length > 0 && (
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
                    Followers: {userDetails.followersCount}
                  </Typography>
                </Grid>
                <Grid item container>
                  {shownFollowersWithInfo.map((user) => (
                    <UserInformation {...user} key={user.id} />
                  ))}
                </Grid>
              </>
            )}
          {accountExists &&
            (!shownFollowersWithInfo || shownFollowersWithInfo.length < 1) && (
              <Grid item width="100%">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: "31px",
                    textAlign: "center",
                  }}
                >
                  This account doesn't have any followers
                </Typography>
              </Grid>
            )}
        </Grid>
      )}
    </Box>
  );
}
