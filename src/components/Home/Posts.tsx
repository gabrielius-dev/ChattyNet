import { useEffect, useState, useCallback } from "react";
import Post from "./Post";
import { Stack } from "@mui/material";
import {
  DocumentData,
  QueryDocumentSnapshot,
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
  writeBatch,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  hideHomeContent,
  setErrorMessage,
  setIsSnackbarOpen,
  showHomeContent,
} from "../../app/features/UISlice";
import {
  changePostInfoAfterLiking,
  clearAllPosts,
  addPosts,
  changePostInfoAfterBookmarking,
} from "../../app/features/postsSlice";
import { PostData, PostInterface } from "../../app/types/postType";
import {
  doesNotificationAlreadyExist,
  getUsersInfo,
} from "../../app/helperFunctions";
import CircularProgressComponent from "../CircularProgress";
import { setUser } from "../../app/features/userSlice";

export default function Posts() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);
  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [morePostsExist, setMorePostsExist] = useState(true);
  const userUID = useAppSelector((state) => state.user.uid);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [processingLikePosts, setProcessingLikePosts] = useState<string[]>([]);
  const isHomeContentLoading = useAppSelector(
    (state) => state.UI.isHomeContentLoading
  );
  const [processingBookmarkPosts, setProcessingBookmarkPosts] = useState<
    string[]
  >([]);

  const getInitialPosts = useCallback(async () => {
    dispatch(clearAllPosts());
    const q1 = query(
      collection(db, "posts"),
      orderBy("date", "desc"),
      limit(20)
    );

    const querySnapshot1 = await getDocs(q1);
    if (querySnapshot1.empty) return;

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
        createdBy: matchingObject?.createdBy,
        fullName: matchingObject?.fullName,
        photoURL: matchingObject?.photoURL,
        information: matchingObject?.information,
        followers: matchingObject?.followersCount,
        following: matchingObject?.followingCount,
      } as PostData;
    });
    return postsWithUserInfo;
  }, [dispatch, isLoggedIn, userUID]);

  const loadMorePosts = useCallback(async () => {
    if (!morePostsExist) return;
    setLoadingMorePosts(true);
    const q1 = query(
      collection(db, "posts"),
      orderBy("date", "desc"),
      startAfter(lastVisiblePost),
      limit(20)
    );
    const querySnapshot1 = await getDocs(q1);
    if (querySnapshot1.empty) {
      setLoadingMorePosts(false);
      setMorePostsExist(false);
      return;
    }
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
        createdBy: matchingObject?.createdBy,
        fullName: matchingObject?.fullName,
        photoURL: matchingObject?.photoURL,
        information: matchingObject?.information,
        followers: matchingObject?.followersCount,
        following: matchingObject?.followingCount,
      } as PostData;
    });

    dispatch(addPosts(postsWithUserInfo));
  }, [dispatch, isLoggedIn, lastVisiblePost, morePostsExist, userUID]);

  useEffect(() => {
    async function getAndAddPosts() {
      dispatch(hideHomeContent());
      const posts = (await getInitialPosts()) || [];
      dispatch(clearAllPosts());
      dispatch(addPosts(posts));
      dispatch(showHomeContent());
    }
    getAndAddPosts();
  }, [dispatch, getInitialPosts]);

  useEffect(() => {
    function onScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= scrollableHeight) {
        if (!loadingMorePosts || morePostsExist) loadMorePosts();
      }
    }
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [loadMorePosts, loadingMorePosts, morePostsExist]);

  const handleLikeClick = useCallback(
    async (id: string, postCreatorUID: string) => {
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
          // Add notification for user that his post was liked
          // if post creator is current user then don't show a notification
          if (postCreatorUID !== userUID) {
            const notification = {
              type: "post/like",
              forUser: postCreatorUID,
              byUser: userUID,
              elementId: id,
            };
            // if notification already exist
            // maybe user removed like and pressed it again and user haven't checked the notification
            // to not duplicate
            const notificationAlreadyExist = await doesNotificationAlreadyExist(
              notification
            );
            if (!notificationAlreadyExist) {
              await addDoc(collection(db, "notifications"), notification);
            }
          }
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

  return isHomeContentLoading ? (
    <CircularProgressComponent />
  ) : (
    <Stack direction="column">
      {posts.map((post) => (
        <Post
          {...post}
          key={post.postId}
          handleLikeClick={handleLikeClick}
          handleBookmarkClick={handleBookmarkClick}
        />
      ))}
    </Stack>
  );
}
