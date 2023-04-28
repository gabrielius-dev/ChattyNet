import {
  Avatar,
  Box,
  Divider,
  Grid,
  Typography,
  TextField,
  IconButton,
  Button,
} from "@mui/material";

import {
  AddPhotoAlternateOutlined,
  GifBoxOutlined,
  SentimentSatisfiedOutlined,
  AutoAwesomeOutlined,
} from "@mui/icons-material";

export default function StatusUpdate() {
  return (
    <Box
      sx={{
        width: "52vw",
        maxWidth: "1000px",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
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
      <Grid container spacing={2} padding={1}>
        <Grid item sx={{ paddingTop: "1.5rem !important" }}>
          <Avatar></Avatar>
        </Grid>
        <Grid item xs={12} sm container spacing={2}>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              label="What's happening?"
              multiline
              maxRows={3}
            />
          </Grid>
          <Grid item xs={12} container>
            <Grid item xs container>
              <IconButton
                aria-label="upload image"
                color="primary"
                component="label"
              >
                <input hidden accept="image/*" multiple type="file" />
                <AddPhotoAlternateOutlined />
              </IconButton>
              <IconButton aria-label="add gif" color="primary">
                <GifBoxOutlined />
              </IconButton>
              <IconButton aria-label="add smile" color="primary">
                <SentimentSatisfiedOutlined />
              </IconButton>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary">
                Tweet
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      <Box
        sx={{ height: "0.5rem", backgroundColor: "rgba(0, 0, 0, 0.12)" }}
      ></Box>
    </Box>
  );
}
