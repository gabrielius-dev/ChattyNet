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
import { useAppSelector } from "../../app/hooks";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../app/firebase/firebase";

const StatusUpdate = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const userUid = useAppSelector((state) => state.user.uid);
  const photoURL = useAppSelector((state) => state.user.photoURL);
  const username = useAppSelector((state) => state.user.username);
  const [text, setText] = useState("");

  async function submitPost() {
    await addDoc(collection(db, "posts"), {
      createdBy: userUid,
      text,
      likes: 0,
      comments: [],
      date: serverTimestamp(),
    });
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
