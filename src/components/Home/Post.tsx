import { memo, useState, useRef, useEffect } from "react";
import {
  Avatar,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SendIcon from "@mui/icons-material/Send";
import { LIGHT_BLUE_COLOR, LIGHT_GRAY_COLOR } from "../../styles/colors";
import {
  CommentData,
  CommentInterface,
  PostComponentArguments,
} from "../../app/types/postType";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import { formatNumber, getUsersInfo } from "../../app/helperFunctions";
import Comment from "./Comment";
import { changePostInfoAfterCommenting } from "../../app/features/postsSlice";
import ProfileSummary from "./ProfileSummary";
import { Link } from "react-router-dom";

const Post = memo(
  ({
    photoURL,
    fullName,
    username,
    date,
    text,
    likes,
    postId,
    commentsCount,
    handleLikeClick,
    hasLiked,
    information,
    followers,
    following,
  }: PostComponentArguments) => {
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
    const userUID = useAppSelector((state) => state.user.uid);
    const [commentText, setCommentText] = useState("");
    const [showCommentSection, setShowCommentSection] = useState(false);
    const commentRef = useRef<HTMLInputElement>(null);
    const currentUserPhotoURL = useAppSelector((state) => state.user.photoURL);
    const currentUserUsername = useAppSelector((state) => state.user.username);
    const currentUserFullName = useAppSelector((state) => state.user.fullName);
    const currentUserInformation = useAppSelector(
      (state) => state.user.information
    );
    const currentUserFollowers = useAppSelector(
      (state) => state.user.followers
    );
    const currentUserFollowing = useAppSelector(
      (state) => state.user.following
    );
    const [comments, setComments] = useState<CommentData[]>([]);
    const [processingLikeComments, setProcessingLikeComments] = useState<
      string[]
    >([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [lastVisibleComment, setLastVisibleComment] =
      useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [moreCommentsExist, setMoreCommentsExist] = useState(true);
    const [showProfileSummary, setShowProfileSummary] = useState(false);
    const [profileSummaryCoords, setProfileSummaryCoords] = useState({
      x: 0,
      y: 0,
    });
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [hovered, setHovered] = useState(false);

    function displayError() {
      dispatch(setErrorMessage("You must sign in to like."));
      dispatch(setIsSnackbarOpen(true));
    }

    async function loadInitialComments() {
      if (commentsCount <= 5) setMoreCommentsExist(false);
      setLoadingComments(true);
      const postCommentsRef = collection(db, "postsComments");
      const q = query(
        postCommentsRef,
        where("postId", "==", postId),
        orderBy("date", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setLoadingComments(false);
        return;
      }

      setLastVisibleComment(querySnapshot.docs[querySnapshot.docs.length - 1]);

      const usersUID = querySnapshot.docs.map((doc) => doc.data().createdBy);
      const usersInfo = await getUsersInfo(usersUID);
      const commentsWithoutUserInfo: CommentInterface[] =
        querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              date: doc.data().date.toDate().toDateString(),
              commentId: doc.id,
            } as CommentInterface)
        );

      const commentsWithUserInfo: CommentData[] = commentsWithoutUserInfo.map(
        (comment) => {
          const matchingObject = usersInfo.find(
            (item) => item.id === comment.createdBy
          );
          let hasLikedComment = null;
          if (isLoggedIn)
            if (comment.likedUsers.includes(userUID)) hasLikedComment = true;
            else hasLikedComment = false;
          return {
            ...comment,
            hasLikedComment,
            username: matchingObject?.username,
            fullName: matchingObject?.fullName,
            photoURL: matchingObject?.photoURL,
            information: matchingObject?.information,
            followers: matchingObject?.followers,
            following: matchingObject?.following,
          } as CommentData;
        }
      );
      setLoadingComments(false);
      setComments(commentsWithUserInfo);
    }

    async function handleCommentClick() {
      setShowCommentSection(!showCommentSection);
      if (
        (comments.length === commentsCount && commentsCount > 0) ||
        showCommentSection
      )
        return;
      await loadInitialComments();
    }
    async function addComment() {
      if (!commentText) {
        commentRef.current?.focus();
        dispatch(setErrorMessage("Comment field cannot be left empty."));
        dispatch(setIsSnackbarOpen(true));
        return;
      }

      try {
        const docRef = await addDoc(collection(db, "postsComments"), {
          createdBy: userUID,
          text: commentText,
          date: Timestamp.now(),
          likedUsers: [],
          likes: 0,
          postId,
        });
        await updateDoc(doc(db, "posts", postId), {
          commentsCount: increment(1),
        });
        dispatch(changePostInfoAfterCommenting(postId));

        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const date = snapshot.data().date.toDate().toDateString();
          const commentId = docRef.id;
          setComments([
            {
              text: commentText,
              date,
              likes: 0,
              commentId,
              photoURL: currentUserPhotoURL,
              username: currentUserUsername,
              fullName: currentUserFullName,
              information: currentUserInformation,
              followers: currentUserFollowers,
              following: currentUserFollowing,
              hasLikedComment: false,
            },
            ...comments,
          ]);
        }
        setCommentText("");
      } catch {
        dispatch(setErrorMessage("Error occurred. Try again later!"));
        dispatch(setIsSnackbarOpen(true));
      }
    }

    async function handleCommentLikeClick(id: string) {
      // If checking wouldn't exist then after non-stop like clicking the like count gets incorrect
      if (processingLikeComments.includes(id)) {
        dispatch(setErrorMessage("Wait before liking again!"));
        dispatch(setIsSnackbarOpen(true));
        return;
      }
      try {
        setProcessingLikeComments((currentComments) => [
          ...currentComments,
          id,
        ]);
        const docRef = doc(db, "postsComments", id);
        const querySnapshot = await getDoc(docRef);
        const likedUsers = querySnapshot.data()?.likedUsers;

        setProcessingLikeComments((currentComments) =>
          currentComments.filter((comment) => comment !== id)
        );
        if (likedUsers.includes(userUID)) {
          updateDoc(docRef, {
            likedUsers: arrayRemove(userUID),
            likes: increment(-1),
          });
        } else {
          updateDoc(docRef, {
            likedUsers: arrayUnion(userUID),
            likes: increment(1),
          });
        }

        setComments(
          comments.map((comment) => {
            if (comment.commentId === id) {
              const updatedLikes = comment.hasLikedComment
                ? comment.likes - 1
                : comment.likes + 1;
              return {
                ...comment,
                likes: updatedLikes,
                hasLikedComment: !comment.hasLikedComment,
              };
            }
            return comment;
          })
        );
      } catch {
        dispatch(
          setErrorMessage(
            "Error occurred while liking comment. Try again later!"
          )
        );
        dispatch(setIsSnackbarOpen(true));
      }
    }

    async function showMoreComments() {
      if (!moreCommentsExist) return;

      const postCommentsRef = collection(db, "postsComments");
      const q = query(
        postCommentsRef,
        where("postId", "==", postId),
        orderBy("date", "desc"),
        startAfter(lastVisibleComment),
        limit(5)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMoreCommentsExist(false);
        return;
      }
      if (querySnapshot.docs.length <= 5) {
        setMoreCommentsExist(false);
      }
      setLastVisibleComment(querySnapshot.docs[querySnapshot.docs.length - 1]);

      const usersUID = querySnapshot.docs.map((doc) => doc.data().createdBy);
      const usersInfo = await getUsersInfo(usersUID);
      const commentsWithoutUserInfo: CommentInterface[] =
        querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              date: doc.data().date.toDate().toDateString(),
              commentId: doc.id,
            } as CommentInterface)
        );

      const commentsWithUserInfo: CommentData[] = commentsWithoutUserInfo.map(
        (comment) => {
          const matchingObject = usersInfo.find(
            (item) => item.id === comment.createdBy
          );
          let hasLikedComment = null;
          if (isLoggedIn)
            if (comment.likedUsers.includes(userUID)) hasLikedComment = true;
            else hasLikedComment = false;
          return {
            ...comment,
            hasLikedComment,
            username: matchingObject?.username,
            fullName: matchingObject?.fullName,
            photoURL: matchingObject?.photoURL,
            information: matchingObject?.information,
            followers: matchingObject?.followers,
            following: matchingObject?.following,
          } as CommentData;
        }
      );
      setLoadingComments(false);
      setComments([...comments, ...commentsWithUserInfo]);
    }

    useEffect(() => {
      setShowCommentSection(false);
      setComments([]);
    }, [isLoggedIn]);

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
        // For safety
        onMouseOut={() => {
          if (timer) clearTimeout(timer);
          setShowProfileSummary(false);
        }}
      >
        <Grid item>
          <Link
            to={username}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Avatar src={photoURL ?? undefined} sx={{ cursor: "pointer" }}>
              {!photoURL && username[0].toUpperCase()}
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
                to={username}
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
                to={username}
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
          </Grid>
          <Grid item container xs={12}>
            <Grid item>
              <Button
                onClick={handleCommentClick}
                sx={{
                  color: showCommentSection ? LIGHT_BLUE_COLOR : "#808080",
                  "&:hover": {
                    backgroundColor: "inherit",
                    color: LIGHT_BLUE_COLOR,
                  },
                  display: "flex",
                  gap: 1,
                }}
              >
                {showCommentSection ? (
                  <ChatBubbleRoundedIcon />
                ) : (
                  <ChatBubbleOutlineRoundedIcon />
                )}
                {formatNumber(commentsCount)}
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={
                  hasLiked !== null
                    ? () => handleLikeClick(postId)
                    : displayError
                }
                sx={{
                  color: hasLiked ? LIGHT_BLUE_COLOR : "#808080",
                  "&:hover": {
                    backgroundColor: "inherit",
                    color: LIGHT_BLUE_COLOR,
                  },
                  display: "flex",
                  gap: 1,
                }}
              >
                {hasLiked ? <FavoriteIcon /> : <FavoriteBorderRoundedIcon />}
                {formatNumber(likes)}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {showCommentSection && (
          <Grid
            item
            container
            xs={12}
            sx={{
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
              paddingBottom: 1,
              paddingRight: 10,
            }}
          >
            {isLoggedIn && (
              <Grid item container spacing={1}>
                <Grid item>
                  <Avatar src={currentUserPhotoURL ?? undefined}>
                    {!currentUserPhotoURL && username[0].toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <TextField
                    label="Add a comment..."
                    fullWidth
                    multiline
                    variant="standard"
                    maxRows={5}
                    onChange={(e) => setCommentText(e.target.value)}
                    value={commentText}
                    inputProps={{ maxLength: 1000 }}
                    inputRef={commentRef}
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    sx={{ color: LIGHT_BLUE_COLOR }}
                    onClick={addComment}
                  >
                    <SendIcon />
                  </IconButton>
                </Grid>
              </Grid>
            )}
            {comments.map((comment) => (
              <Comment
                {...comment}
                handleLikeClick={handleCommentLikeClick}
                key={comment.commentId}
              />
            ))}
            {!loadingComments && moreCommentsExist && (
              <Grid item xs>
                <Button variant="outlined" fullWidth onClick={showMoreComments}>
                  Show more comments...
                </Button>
              </Grid>
            )}
          </Grid>
        )}
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
              followers={followers}
              following={following}
            />
          </Grid>
        )}
      </Grid>
    );
  }
);
export default Post;
