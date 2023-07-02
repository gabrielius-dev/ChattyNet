import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../app/firebase/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CircularProgressComponent from "../CircularProgress";
import Notification from "./Notification";
import {
  NotificationData,
  NotificationInterface,
} from "../../app/types/notificationType";
import { getUsersInfo } from "../../app/helperFunctions";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import moment from "moment";

export default function Notifications() {
  const currentUserUID = useAppSelector((state) => state.user.uid);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [moreNotificationsExist, setMoreNotificationsExist] = useState(false);
  const [lastVisibleNotification, setLastVisibleNotification] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setLoading(true);
    async function getAndSetNotifications() {
      const q = query(
        collection(db, "notifications"),
        where("forUser", "==", currentUserUID),
        limit(20),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setLoading(false);
        setMoreNotificationsExist(false);
        return;
      }

      setLastVisibleNotification(
        querySnapshot.docs[querySnapshot.docs.length - 1]
      );

      if (querySnapshot.docs.length === 20) setMoreNotificationsExist(true);

      const usersUID = [
        ...new Set(querySnapshot.docs.map((doc) => doc.data().byUser)),
      ];
      const usersInfo = await getUsersInfo(usersUID);

      const notificationsWithoutUserInfo: NotificationInterface[] =
        querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              notificationId: doc.id,
              date: moment(doc.data().date.toDate()).fromNow(),
            } as NotificationInterface)
        );

      const notificationsWithUserInfo: NotificationData[] =
        notificationsWithoutUserInfo.map((notification) => {
          const matchingObject = usersInfo.find(
            (item) => item.id === notification.byUser
          );

          return {
            ...notification,
            username: matchingObject?.username,
            fullName: matchingObject?.fullName,
            photoURL: matchingObject?.photoURL,
            information: matchingObject?.information,
            followers: matchingObject?.followersCount,
            following: matchingObject?.followingCount,
          } as NotificationData;
        });
      setNotifications(notificationsWithUserInfo);
      setLoading(false);
    }
    getAndSetNotifications();
  }, [currentUserUID]);

  async function loadMoreNotifications() {
    if (!moreNotificationsExist) return;
    const q = query(
      collection(db, "notifications"),
      orderBy("date", "desc"),
      where("forUser", "==", currentUserUID),
      startAfter(lastVisibleNotification),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      setMoreNotificationsExist(false);
      return;
    }

    if (querySnapshot.docs.length > 20) setMoreNotificationsExist(true);

    setLastVisibleNotification(
      querySnapshot.docs[querySnapshot.docs.length - 1]
    );
    const usersUID = [
      ...new Set(querySnapshot.docs.map((doc) => doc.data().byUser)),
    ];
    const usersInfo = await getUsersInfo(usersUID);

    const notificationsWithoutUserInfo: NotificationInterface[] =
      querySnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            notificationId: doc.id,
            date: moment(doc.data().date.toDate()).fromNow(),
          } as NotificationInterface)
      );

    const notificationsWithUserInfo: NotificationData[] =
      notificationsWithoutUserInfo.map((notification) => {
        const matchingObject = usersInfo.find(
          (item) => item.id === notification.byUser
        );

        return {
          ...notification,
          username: matchingObject?.username,
          fullName: matchingObject?.fullName,
          photoURL: matchingObject?.photoURL,
          information: matchingObject?.information,
          followers: matchingObject?.followersCount,
          following: matchingObject?.followingCount,
        } as NotificationData;
      });

    setNotifications((previousNotifications) => [
      ...previousNotifications,
      ...notificationsWithUserInfo,
    ]);
  }

  const handleDelete = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
      e.stopPropagation();
      try {
        await deleteDoc(doc(db, "notifications", id));
        setNotifications((notifications) =>
          notifications.filter(
            (notification) => notification.notificationId !== id
          )
        );
      } catch {
        dispatch(
          setErrorMessage(
            "Error occurred while removing notification. Please try again later!"
          )
        );
        dispatch(setIsSnackbarOpen(true));
      }
    },
    [dispatch]
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
                Notifications
              </Typography>
            </Grid>
          </Grid>
          {notifications.length > 0 ? (
            <>
              <Grid item container>
                {notifications.map((notification) => (
                  <Notification
                    {...notification}
                    key={notification.notificationId}
                    handleDelete={handleDelete}
                  />
                ))}
              </Grid>
              {moreNotificationsExist && (
                <Grid item xs>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={async () => {
                      await loadMoreNotifications();
                    }}
                  >
                    Show more notifications...
                  </Button>
                </Grid>
              )}
            </>
          ) : (
            <Grid item width="100%">
              <Typography
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  fontSize: "31px",
                  textAlign: "center",
                }}
              >
                You don't have any notifications
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
