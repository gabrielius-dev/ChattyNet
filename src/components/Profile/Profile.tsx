import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
  startAfter,
  where,
  increment,
  documentId,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
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
import {
  formatNumber,
  getUserInfo,
  getUsersInfo,
} from "../../app/helperFunctions";
import CircularProgressComponent from "../CircularProgress";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { LIGHT_BLUE_COLOR, LIGHT_GRAY_COLOR } from "../../styles/colors";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  setErrorMessage,
  setIsSnackbarOpen,
  showEditProfileForm,
} from "../../app/features/UISlice";
import EditProfileForm from "./EditProfileForm";
import { setUserProfileDetails } from "../../app/features/profileSlice";
import { PostData, PostInterface } from "../../app/types/postType";
import Post from "../Home/Post";
import {
  addPosts,
  changePostInfoAfterBookmarking,
  changePostInfoAfterLiking,
  clearAllPosts,
  setPosts,
} from "../../app/features/postsSlice";
import { setUser } from "../../app/features/userSlice";

export default function Profile() {
  const [stateHasBeenReset, setStateHasBeenReset] = useState(false);
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
  type SelectedElementType = "Tweets" | "Likes";
  const [currentElementSelected, setCurrentElementSelected] =
    useState<SelectedElementType>("Tweets");
  const posts = useAppSelector((state) => state.posts.posts);
  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [morePostsExist, setMorePostsExist] = useState(false);
  const [processingLikePosts, setProcessingLikePosts] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [processingBookmarkPosts, setProcessingBookmarkPosts] = useState<
    string[]
  >([]);

  const getInitialPosts = useCallback(
    async (queryType: "Tweets" | "Likes") => {
      let q1, queryID;
      // User uid

      if (queryType === "Tweets") {
        queryID = userDetails.uid;
      } else if (queryType === "Likes") {
        queryID = userDetails.likedPosts;
        if (userDetails.likedPosts.length === 0) {
          dispatch(clearAllPosts());
          return;
        }
      }
      if (queryType === "Tweets")
        q1 = query(
          collection(db, "posts"),
          orderBy("date", "desc"),
          where("createdBy", "==", queryID),
          limit(20)
        );
      // User liked posts array
      if (queryType === "Likes")
        q1 = query(
          collection(db, "posts"),
          where(documentId(), "in", queryID),
          limit(20)
        );
      if (!q1) return;
      const querySnapshot1 = await getDocs(q1);
      if (querySnapshot1.empty) {
        dispatch(clearAllPosts());
        return;
      }
      setMorePostsExist(querySnapshot1.docs.length === 20);

      setLastVisiblePost(querySnapshot1.docs[querySnapshot1.docs.length - 1]);
      const usersUID = [
        ...new Set(querySnapshot1.docs.map((doc) => doc.data().createdBy)),
      ];
      const usersInfo = await getUsersInfo(usersUID);

      const postsWithoutUserInfo: PostInterface[] = querySnapshot1.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            postId: doc.id,
            date: doc.data().date.toDate().toDateString(),
          } as PostInterface)
      );

      let likedPosts: string[];
      let bookmarks: string[];

      if (isLoggedIn) {
        const docRef = doc(db, "users", currentUserUID);
        const querySnapshot = await getDoc(docRef);
        likedPosts = querySnapshot.data()?.likedPosts;
        bookmarks = querySnapshot.data()?.bookmarks;
      }
      const postsWithUserInfo: PostData[] = postsWithoutUserInfo.map((post) => {
        const matchingObject = usersInfo.find(
          (item) => item.id === post.createdBy
        );
        let hasLiked = null;
        let hasBookmarked = false;
        if (isLoggedIn) {
          if (likedPosts.includes(post.postId)) hasLiked = true;
          else if (!likedPosts.includes(post.postId)) hasLiked = false;
          if (bookmarks.includes(post.postId)) hasBookmarked = true;
          else if (!bookmarks.includes(post.postId)) hasBookmarked = false;
        }

        return {
          ...post,
          hasLiked,
          hasBookmarked,
          username: matchingObject?.username,
          fullName: matchingObject?.fullName,
          photoURL: matchingObject?.photoURL,
          information: matchingObject?.information,
          followers: matchingObject?.followersCount,
          following: matchingObject?.followingCount,
        } as PostData;
      });
      return postsWithUserInfo;
    },
    [
      currentUserUID,
      dispatch,
      isLoggedIn,
      userDetails.likedPosts,
      userDetails.uid,
    ]
  );

  const loadMorePosts = async () => {
    if (!morePostsExist) return;
    let q1, queryType, queryID;
    // User uid
    if (currentElementSelected === "Tweets") {
      queryType = "Tweets";
      queryID = userDetails.uid;
    } else if (currentElementSelected === "Likes") {
      queryType = "Likes";
      queryID = userDetails.likedPosts;
    }

    if (queryType === "Tweets")
      q1 = query(
        collection(db, "posts"),
        orderBy("date", "desc"),
        where("createdBy", "==", queryID),
        startAfter(lastVisiblePost),
        limit(20)
      );
    // User liked posts array
    if (queryType === "Likes")
      q1 = query(
        collection(db, "posts"),
        where(documentId(), "in", queryID),
        startAfter(lastVisiblePost),
        limit(20)
      );

    if (!q1) return;

    const querySnapshot1 = await getDocs(q1);
    if (querySnapshot1.empty) return;
    setMorePostsExist(querySnapshot1.docs.length === 20);
    setLastVisiblePost(querySnapshot1.docs[querySnapshot1.docs.length - 1]);
    const usersUID = [
      ...new Set(querySnapshot1.docs.map((doc) => doc.data().createdBy)),
    ];
    const usersInfo = await getUsersInfo(usersUID);

    const postsWithoutUserInfo: PostInterface[] = querySnapshot1.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          postId: doc.id,
          date: doc.data().date.toDate().toDateString(),
        } as PostInterface)
    );

    let likedPosts: string[];
    let bookmarks: string[];

    if (isLoggedIn) {
      const docRef = doc(db, "users", currentUserUID);
      const querySnapshot = await getDoc(docRef);
      likedPosts = querySnapshot.data()?.likedPosts;
      bookmarks = querySnapshot.data()?.bookmarks;
    }

    const postsWithUserInfo: PostData[] = postsWithoutUserInfo.map((post) => {
      const matchingObject = usersInfo.find(
        (item) => item.id === post.createdBy
      );
      let hasLiked = null;
      let hasBookmarked = false;
      if (isLoggedIn) {
        if (likedPosts.includes(post.postId)) hasLiked = true;
        else if (!likedPosts.includes(post.postId)) hasLiked = false;
        if (bookmarks.includes(post.postId)) hasBookmarked = true;
        else if (!bookmarks.includes(post.postId)) hasBookmarked = false;
      }

      return {
        ...post,
        hasLiked,
        hasBookmarked,
        username: matchingObject?.username,
        fullName: matchingObject?.fullName,
        photoURL: matchingObject?.photoURL,
        information: matchingObject?.information,
        followers: matchingObject?.followersCount,
        following: matchingObject?.followingCount,
      } as PostData;
    });

    dispatch(addPosts(postsWithUserInfo));
  };

  useEffect(() => {
    function resetProfileState() {
      setStateHasBeenReset(false);
      setAccountExists(false);
      setUserUID("");
      dispatch(
        setUserProfileDetails({
          uid: "",
          username: "",
          fullName: "",
          photoURL: null,
          headerPhotoURL: null,
          information: "",
          followersCount: 0,
          followingCount: 0,
          following: [],
          followers: [],
          creationDate: null,
          tweetsCount: 0,
          likedPosts: [],
        })
      );
      setLoading(true);
      setHoveredFollowers(false);
      setHoveredFollowing(false);
      setIsFollowing(false);
      setLastVisiblePost(null);
      setMorePostsExist(false);
      setProcessingLikePosts([]);
      setIsFetching(true);
      setProcessingBookmarkPosts([]);
    }
    dispatch(clearAllPosts());
    resetProfileState();
    setStateHasBeenReset(true);
  }, [dispatch, username]);

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
  }, [dispatch, userUID, username]);

  useEffect(() => {
    if (userDetails) {
      setIsFollowing(userDetails?.followers.includes(currentUserUID));
    }
  }, [userDetails, currentUserUID]);

  // if userDetails changes (edit Profile)
  useEffect(() => {
    if (!stateHasBeenReset) return;
    async function reloadPosts() {
      if (!userDetails.uid) return;
      const returnedPosts =
        (await getInitialPosts(currentElementSelected)) || [];
      dispatch(setPosts(returnedPosts));
    }
    reloadPosts();
  }, [
    currentElementSelected,
    dispatch,
    getInitialPosts,
    stateHasBeenReset,
    userDetails,
  ]);

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

  async function handleTweetsClick() {
    setIsFetching(true);
    setCurrentElementSelected("Tweets");
    const returnedPosts = (await getInitialPosts("Tweets")) || [];
    dispatch(setPosts(returnedPosts));
    setIsFetching(false);
  }

  async function handleLikesClick() {
    setIsFetching(true);
    setCurrentElementSelected("Likes");
    const returnedPosts = (await getInitialPosts("Likes")) || [];
    dispatch(setPosts(returnedPosts));
    setIsFetching(false);
  }

  // Non-stop clicking Tweets and Likes can sometimes display wrong posts
  // Edge case fix
  useEffect(() => {
    async function edgeCaseFix() {
      if (isFetching) return;

      if (
        currentElementSelected === "Likes" &&
        posts.length !== userDetails.likedPosts.length
      ) {
        const returnedPosts = (await getInitialPosts("Likes")) || [];
        dispatch(setPosts(returnedPosts));
      } else if (
        currentElementSelected === "Tweets" &&
        posts.length === userDetails.likedPosts.length
      ) {
        const returnedPosts = (await getInitialPosts("Tweets")) || [];
        dispatch(setPosts(returnedPosts));
      }
    }
    edgeCaseFix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentElementSelected,
    dispatch,
    getInitialPosts,
    posts.length,
    userDetails.likedPosts.length,
  ]);

  const handleLikeClick = useCallback(
    async (id: string) => {
      // If checking wouldn't exist then after non-stop like clicking the like count gets incorrect
      if (processingLikePosts.includes(id)) {
        dispatch(setErrorMessage("Wait before liking again!"));
        dispatch(setIsSnackbarOpen(true));
        return;
      }
      try {
        setProcessingLikePosts((currentPosts) => [...currentPosts, id]);
        const batch = writeBatch(db);

        const docRef = doc(db, "users", currentUserUID);
        const querySnapshot = await getDoc(docRef);
        const likedPosts = querySnapshot.data()?.likedPosts;

        if (likedPosts.includes(id)) {
          batch.update(docRef, {
            likedPosts: arrayRemove(id),
          });
          batch.update(doc(db, "posts", id), {
            likes: increment(-1),
          });
        } else {
          batch.update(docRef, {
            likedPosts: arrayUnion(id),
          });
          batch.update(doc(db, "posts", id), {
            likes: increment(1),
          });
        }

        setProcessingLikePosts((currentPosts) =>
          currentPosts.filter((post) => post !== id)
        );
        await batch.commit();
        dispatch(changePostInfoAfterLiking(id));
      } catch (error) {
        dispatch(
          setErrorMessage("Error occurred while liking post. Try again later!")
        );
        dispatch(setIsSnackbarOpen(true));
      }
    },
    [dispatch, processingLikePosts, currentUserUID]
  );
  const handleBookmarkClick = useCallback(
    async (id: string) => {
      // If checking wouldn't exist then after non-stop like clicking the like count gets incorrect
      if (processingBookmarkPosts.includes(id)) {
        dispatch(setErrorMessage("Wait before bookmarking again!"));
        dispatch(setIsSnackbarOpen(true));
        return;
      }
      try {
        setProcessingBookmarkPosts((currentPosts) => [...currentPosts, id]);

        const docRef = doc(db, "users", userUID);
        const querySnapshot = await getDoc(docRef);
        const bookmarks = querySnapshot.data()?.bookmarks;

        if (bookmarks.includes(id)) {
          await updateDoc(docRef, {
            bookmarks: arrayRemove(id),
          });
          dispatch(
            setUser({
              bookmarks: bookmarks.filter(
                (bookmark: string) => bookmark !== id
              ),
            })
          );
        } else {
          await updateDoc(docRef, {
            bookmarks: arrayUnion(id),
          });
          dispatch(setUser({ bookmarks: [...bookmarks, id] }));
        }

        setProcessingBookmarkPosts((currentPosts) =>
          currentPosts.filter((post) => post !== id)
        );
        dispatch(changePostInfoAfterBookmarking(id));
      } catch {
        dispatch(
          setErrorMessage(
            "Error occurred while bookmarking post. Try again later!"
          )
        );
        dispatch(setIsSnackbarOpen(true));
      }
    },
    [dispatch, processingBookmarkPosts, userUID]
  );

  return (
    <Box
      sx={{
        borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        width: "52vw",
        maxWidth: "1000px",
        boxSizing: "content-box",
        pb: 3,
        marginBottom: !isLoggedIn ? "70px" : 0,
        position: "relative",
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
            <Grid
              item
              sx={{ marginTop: "-80px", width: "150px", height: "150px" }}
            >
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
              <Grid
                item
                container
                sx={{
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Grid
                  item
                  onClick={handleTweetsClick}
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 1,
                    cursor: "pointer",
                    color:
                      currentElementSelected === "Tweets"
                        ? "black"
                        : LIGHT_GRAY_COLOR,
                    fontWeight: "bold",
                    transition: "background-color 0.3s ease",
                    borderBottom: `2px solid ${
                      currentElementSelected === "Tweets"
                        ? LIGHT_BLUE_COLOR
                        : "transparent"
                    }`,
                    "&:hover": {
                      bgcolor: "#FAFAFA",
                      color: "black",
                    },
                  }}
                >
                  Tweets
                </Grid>
                <Grid
                  item
                  onClick={handleLikesClick}
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 1,
                    cursor: "pointer",
                    color:
                      currentElementSelected === "Likes"
                        ? "black"
                        : LIGHT_GRAY_COLOR,
                    fontWeight: "bold",
                    transition: "background-color 0.3s ease",
                    borderBottom: `2px solid ${
                      currentElementSelected === "Likes"
                        ? LIGHT_BLUE_COLOR
                        : "transparent"
                    }`,
                    "&:hover": {
                      bgcolor: "#FAFAFA",
                      color: "black",
                    },
                  }}
                >
                  Likes
                </Grid>
              </Grid>
              <Grid item container justifyContent="center">
                {posts.map((post) => (
                  <Post
                    {...post}
                    key={post.postId}
                    handleLikeClick={handleLikeClick}
                    handleBookmarkClick={handleBookmarkClick}
                  />
                ))}
                {posts.length === 0 && userDetails.fullName && (
                  <Grid item>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: "31px",
                      }}
                    >
                      {currentElementSelected === "Tweets"
                        ? `${userDetails.fullName} doesn't have any tweets.`
                        : `${userDetails.fullName} haven't liked any posts.`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              {morePostsExist && (
                <Grid item xs>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={async () => {
                      await loadMorePosts();
                    }}
                  >
                    Show more posts...
                  </Button>
                </Grid>
              )}
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
