import {
  Avatar,
  Box,
  Divider,
  Grid,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useState, useRef } from "react";
import {
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import { addNewPost } from "../../app/features/postsSlice";
import { PostData } from "../../app/types/postType";

const StatusUpdate = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const userUid = useAppSelector((state) => state.user.uid);
  const photoURL = useAppSelector((state) => state.user.photoURL);
  const username = useAppSelector((state) => state.user.username);
  const fullName = useAppSelector((state) => state.user.fullName);
  const information = useAppSelector((state) => state.user.information);
  const followers = useAppSelector((state) => state.user.followers);
  const following = useAppSelector((state) => state.user.following);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addPost = async (date: string, postId: string) => {
    const post: PostData = {
      username,
      fullName,
      photoURL,
      information,
      followers,
      following,
      date,
      text,
      likes: 0,
      commentsCount: 0,
      postId,
      hasLiked: false,
    };
    dispatch(addNewPost(post));
  };

  async function submitPost() {
    if (!text) {
      inputRef.current?.focus();
      dispatch(setErrorMessage("Enter something before posting."));
      dispatch(setIsSnackbarOpen(true));
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        createdBy: userUid,
        text,
        likes: 0,
        commentsCount: 0,
        date: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const date = snapshot.data().date.toDate().toDateString();
        const postId = docRef.id;
        addPost(date, postId);
      }

      setText("");
    } catch {
      dispatch(
        setErrorMessage("Error occurred while creating post. Try again later!")
      );
      dispatch(setIsSnackbarOpen(true));
    }
  }

  return (
    <Box
      sx={{
        width: "52vw",
        maxWidth: "1000px",
      }}
    >
      <Grid
        container
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{ padding: "0.5rem" }}
      >
        <Typography variant="h5">Home</Typography>
        <AutoAwesomeOutlined color="primary" sx={{ transform: "scaleX(-1)" }} />
      </Grid>
      <Divider />
      {isLoggedIn && (
        <Grid container spacing={2} padding={1}>
          <Grid item sx={{ paddingTop: "1.5rem !important" }}>
            <Avatar src={photoURL}>
              {!photoURL && username[0].toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={12} sm container spacing={2}>
            <Grid item xs display="flex">
              <TextField
                label="What's happening?"
                fullWidth
                multiline
                maxRows={5}
                onChange={(e) => setText(e.target.value)}
                value={text}
                inputProps={{ maxLength: 1000 }}
                inputRef={inputRef}
              />
            </Grid>
            <Grid item xs={12} container>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "20px", textTransform: "none" }}
                  onClick={submitPost}
                >
                  Tweet
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Box
        sx={{ height: "0.5rem", backgroundColor: "rgba(0, 0, 0, 0.12)" }}
      ></Box>
    </Box>
  );
};

export default StatusUpdate;
