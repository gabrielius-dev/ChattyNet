import {
  Modal,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  hideEditProfileForm,
  setErrorMessage,
  setIsSnackbarOpen,
} from "../../app/features/UISlice";
import { LIGHT_BLUE_COLOR } from "../../styles/colors";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { ChangeEvent, useRef, useState } from "react";
import Resizer from "react-image-file-resizer";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../app/firebase/firebase";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { setUserProfileDetails } from "../../app/features/profileSlice";
import { setUser } from "../../app/features/userSlice";

export default function EditProfileForm() {
  const dispatch = useAppDispatch();
  const userDetails = useAppSelector((state) => state.profile);
  const open = useAppSelector((state) => state.UI.isEditProfileFormShowing);
  const profileRef = useRef<HTMLInputElement | null>(null);
  const headerRef = useRef<HTMLInputElement | null>(null);
  const [profilePictureChanged, setProfilePictureChanged] = useState(false);
  const [headerPictureChanged, setHeaderPictureChanged] = useState(false);
  const [profilePhotoSrc, setProfilePhotoSrc] = useState<string | undefined>(
    undefined
  );
  const [profilePhotoBlob, setProfilePhotoBlob] = useState<Blob | null>(null);
  const [headerPhotoBlob, setHeaderPhotoBlob] = useState<Blob | null>(null);
  const [headerPhotoSrc, setHeaderPhotoSrc] = useState<string | undefined>(
    undefined
  );
  const [profilePhotoName, setProfilePhotoName] = useState("");
  const [headerPhotoName, setHeaderPhotoName] = useState("");
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");

  function editProfilePicture() {
    profileRef.current?.click();
  }

  function editProfileHeader() {
    headerRef.current?.click();
  }

  async function convertBase64ToBlob(base64Data: string) {
    const base64 = await fetch(base64Data);
    const blob = await base64.blob();
    return blob;
  }

  async function handleProfilePicture(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type && !file.type.startsWith("image/")) {
      dispatch(setIsSnackbarOpen(true));
      dispatch(setErrorMessage("Selected file is not an image"));
      return;
    }
    const photo = await resizeFile(file, [150, 150]);

    if (!photo) return;

    setProfilePhotoSrc(photo);
    const photoBlob = await convertBase64ToBlob(photo);
    setProfilePhotoBlob(photoBlob);
    setProfilePhotoName(file.name);
    setProfilePictureChanged(true);
  }

  async function handleHeaderPicture(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type && !file.type.startsWith("image/")) {
      dispatch(setIsSnackbarOpen(true));
      dispatch(setErrorMessage("Selected file is not an image"));
      return;
    }
    const photo = await resizeFile(file, [1000, 250]);

    if (!photo) return;

    setHeaderPhotoSrc(photo);
    const photoBlob = await convertBase64ToBlob(photo);
    setHeaderPhotoBlob(photoBlob);
    setHeaderPhotoName(file.name);
    setHeaderPictureChanged(true);
  }

  const resizeFile = (
    file: File,
    size: number[]
  ): Promise<string | undefined> =>
    new Promise<string | undefined>((resolve) => {
      Resizer.imageFileResizer(
        file,
        size[0],
        size[1],
        "JPEG",
        80,
        0,
        (value: string | File | Blob | ProgressEvent<FileReader>) => {
          if (typeof value === "string") {
            resolve(value);
          } else if (value instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              resolve(base64data);
            };
            reader.readAsDataURL(value);
          }
        },
        "base64"
      );
    });

  async function submitEdit() {
    const userUID = userDetails.uid;
    const docRef = doc(db, "users", userUID);
    let profilePhotoDownloadURL, headerPhotoDownloadURL;

    const uploadPromises = [];

    if (profilePhotoBlob) {
      const storageRef = ref(
        storage,
        `images/${userDetails.uid}/profile/${profilePhotoName}`
      );
      const uploadPromise = uploadBytes(storageRef, profilePhotoBlob)
        .then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          await setDoc(
            docRef,
            {
              photoURL: downloadURL,
            },
            { merge: true }
          );
          dispatch(setUser({ photoURL: downloadURL }));
          dispatch(setUserProfileDetails({ photoURL: downloadURL }));
          profilePhotoDownloadURL = downloadURL;
        })
        .catch(() => {
          dispatch(setIsSnackbarOpen(true));
          dispatch(
            setErrorMessage("Error occurred while uploading profile picture.")
          );
        });
      uploadPromises.push(uploadPromise);
    }

    if (headerPhotoBlob) {
      const storageRef = ref(
        storage,
        `images/${userDetails.uid}/profile/${headerPhotoName}`
      );
      const uploadPromise = uploadBytes(storageRef, headerPhotoBlob)
        .then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          await setDoc(
            docRef,
            {
              headerPhotoURL: downloadURL,
            },
            { merge: true }
          );
          dispatch(setUserProfileDetails({ headerPhotoURL: downloadURL }));
          headerPhotoDownloadURL = downloadURL;
        })
        .catch(() => {
          dispatch(setIsSnackbarOpen(true));
          dispatch(
            setErrorMessage("Error occurred while uploading header picture.")
          );
        });
      uploadPromises.push(uploadPromise);
    }

    const batch = writeBatch(db);

    if (newName) {
      batch.update(docRef, { fullName: newName });
    }

    if (newBio) {
      batch.update(docRef, {
        information: newBio,
      });
    }

    try {
      await batch.commit();
      // Have to do this in case if batch.commit() fails then name and bio shouldn't be set
      if (newName) {
        dispatch(setUserProfileDetails({ fullName: newName }));
        dispatch(setUser({ fullName: newName }));
      }
      if (newBio) {
        dispatch(setUserProfileDetails({ information: newBio }));
        dispatch(setUser({ information: newBio }));
      }
    } catch {
      dispatch(setIsSnackbarOpen(true));
      dispatch(setErrorMessage("Error occurred while editing profile."));
    }

    await Promise.all(uploadPromises); // Await all the upload promises

    await deleteUnusedImages(profilePhotoDownloadURL, headerPhotoDownloadURL);
    dispatch(hideEditProfileForm());
  }

  async function deleteUnusedImages(
    url1: string | undefined,
    url2: string | undefined
  ) {
    const listRef = ref(storage, `images/${userDetails.uid}/profile`);
    listAll(listRef).then(async (res) => {
      res.items.forEach(async (itemRef) => {
        const imageURL = await getDownloadURL(itemRef);

        // Don't delete recently changed profile pictures and delete previous profile pictures
        const notToDelete = [
          url1 || userDetails.photoURL,
          url2 || userDetails.headerPhotoURL,
        ];

        if (imageURL === notToDelete[0] || imageURL === notToDelete[1]) return;

        const imageRef = ref(storage, imageURL);
        await deleteObject(imageRef);
      });
    });
  }

  return (
    <Modal open={open}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "15px",
          width: "500px",
          height: "550px",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <IconButton
            onClick={() => dispatch(hideEditProfileForm())}
            aria-label="close"
          >
            <CloseIcon sx={{ color: LIGHT_BLUE_COLOR }} />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              pr: 3,
              pl: 3,
              ml: "auto",
            }}
            onClick={submitEdit}
          >
            Save
          </Button>
        </Box>
        <Box mb={2}>
          <Grid
            item
            sx={{
              width: "100%",
              height: "150px",
              mb: "6px",
              position: "relative",
            }}
            onClick={editProfileHeader}
          >
            {userDetails?.headerPhotoURL || headerPictureChanged ? (
              <Box sx={{ position: "relative" }}>
                <img
                  src={
                    headerPictureChanged
                      ? headerPhotoSrc
                      : userDetails.headerPhotoURL || undefined
                  }
                  style={{ width: "100%", height: "150px" }}
                  alt="Header image"
                />
                <PhotoCameraOutlinedIcon
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    color: "white",
                  }}
                />
                <input
                  ref={headerRef}
                  type="file"
                  style={{ display: "none" }}
                  accept="image/png, image/jpeg"
                  onChange={handleHeaderPicture}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  backgroundColor: "#CFD9DE",
                  width: "100%",
                  height: "150px",
                  position: "relative",
                }}
              >
                <PhotoCameraOutlinedIcon
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    color: "white",
                  }}
                />
                <input
                  ref={headerRef}
                  type="file"
                  style={{ display: "none" }}
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleHeaderPicture(e)}
                />
              </Box>
            )}
          </Grid>
          <Grid
            item
            container
            sx={{
              pr: 2,
              pl: 2,
              marginTop: "-60px",
              width: "fit-content",
              position: "relative",
            }}
            onClick={editProfilePicture}
          >
            {userDetails?.photoURL || profilePictureChanged ? (
              <>
                <img
                  src={
                    profilePictureChanged
                      ? profilePhotoSrc
                      : userDetails.photoURL || undefined
                  }
                  style={{
                    width: "125px",
                    height: "125px",
                    borderRadius: "50%",
                    border: "5px solid white",
                  }}
                  alt="Profile picture"
                />
                <PhotoCameraOutlinedIcon
                  sx={{
                    position: "absolute",
                    top: "40%",
                    left: "42%",
                    color: "white",
                  }}
                />
                <input
                  ref={profileRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleProfilePicture}
                  accept="image/png, image/jpeg"
                />
              </>
            ) : (
              <Box
                sx={{
                  backgroundColor: "#F7F9F9",
                  width: "125px",
                  height: "125px",
                  borderRadius: "50%",
                  border: "5px solid white",
                }}
              >
                <PhotoCameraOutlinedIcon
                  sx={{
                    position: "absolute",
                    top: "42%",
                    left: "42%",
                    color: "white",
                  }}
                />
                <input
                  ref={profileRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleProfilePicture}
                  accept="image/png, image/jpeg"
                />
              </Box>
            )}
          </Grid>
        </Box>
        <Box>
          <Stack direction="column" gap={4}>
            <TextField
              variant="filled"
              label="Name"
              inputProps={{ maxLength: 60 }}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              variant="filled"
              label="Bio"
              inputProps={{ maxLength: 500 }}
              multiline
              maxRows={4}
              onChange={(e) => setNewBio(e.target.value)}
            />
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
}
