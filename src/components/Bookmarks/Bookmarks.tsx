import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Post from "../Home/Post";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  documentId,
  getDoc,
  increment,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import {
  addPosts,
  changePostInfoAfterBookmarking,
  changePostInfoAfterLiking,
  clearAllPosts,
  setPosts,
} from "../../app/features/postsSlice";
import { PostData, PostInterface } from "../../app/types/postType";
import { getUsersInfo } from "../../app/helperFunctions";
import { setUser } from "../../app/features/userSlice";
import CircularProgressComponent from "../CircularProgress";

export default function Bookmarks() {
  const [loading, setLoading] = useState(false);
  const posts = useAppSelector((state) => state.posts.posts);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [processingLikePosts, setProcessingLikePosts] = useState<string[]>([]);
  const userUID = useAppSelector((state) => state.user.uid);
  const [processingBookmarkPosts, setProcessingBookmarkPosts] = useState<
    string[]
  >([]);
  const userBookmarks = useAppSelector((state) => state.user.bookmarks);
  const [morePostsExist, setMorePostsExist] = useState(true);
  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const getInitialPosts = useCallback(async () => {
    if (userBookmarks.length === 0) return;
    const q1 = query(
      collection(db, "posts"),
      where(documentId(), "in", userBookmarks),
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
      const docRef = doc(db, "users", userUID);
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
  }, [dispatch, isLoggedIn, userBookmarks, userUID]);

  const loadMorePosts = async () => {
    if (!morePostsExist) return;
    const q1 = query(
      collection(db, "posts"),
      where(documentId(), "in", userBookmarks),
      startAfter(lastVisiblePost),
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
      const docRef = doc(db, "users", userUID);
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
    dispatch(clearAllPosts());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    async function getAndSetPosts() {
      const posts = (await getInitialPosts()) || [];
      dispatch(setPosts(posts));
      setLoading(false);
    }
    getAndSetPosts();
  }, [dispatch, getInitialPosts]);

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

        const docRef = doc(db, "users", userUID);
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
      } catch {
        dispatch(
          setErrorMessage("Error occurred while liking post. Try again later!")
        );
        dispatch(setIsSnackbarOpen(true));
      }
    },
    [dispatch, processingLikePosts, userUID]
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
        position: "relative",
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
                Bookmarks
              </Typography>
            </Grid>
          </Grid>
          {posts.length === 0 ? (
            <Grid
              item
              container
              sx={{
                margin: 10,
                alignItems: "center",
              }}
              direction="column"
            >
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "31px" }}>
                You don't have any bookmarked post.
              </Typography>
            </Grid>
          ) : (
            <Grid item container>
              {posts.map((post) => (
                <Post
                  {...post}
                  key={post.postId}
                  handleLikeClick={handleLikeClick}
                  handleBookmarkClick={handleBookmarkClick}
                />
              ))}
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
        </Grid>
      )}
      {loading && <CircularProgressComponent />}
    </Box>
  );
}
