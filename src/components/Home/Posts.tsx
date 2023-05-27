import { useEffect, useState, useCallback } from "react";
import Post from "./Post";
import { Stack } from "@mui/material";
import {
  DocumentData,
  QueryDocumentSnapshot,
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
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setErrorMessage, setIsSnackbarOpen } from "../../app/features/UISlice";
import {
  changePostInfoAfterLiking,
  clearAllPosts,
  setPosts,
} from "../../app/features/postsSlice";
import { PostData, PostsInterface } from "../../app/types/postType";

export default function Posts() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.posts.posts);

  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [morePostsExist, setMorePostsExist] = useState(true);
  const userUID = useAppSelector((state) => state.user.uid);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // TODO: add new post to posts array so user can see his new post immediately
  // TODO: change heart icon color after it is clicked
  // TODO: implement comments

  const getInitialPosts = useCallback(async () => {
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
    const q2 = query(collection(db, "users"), where("uid", "in", usersUID));
    const querySnapshot2 = await getDocs(q2);
    const usersInfo = querySnapshot2.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      fullName: doc.data().fullName,
      photoURL: doc.data().photoURL || null,
    }));

    const postsWithoutUserInfo: PostsInterface[] = querySnapshot1.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          postId: doc.id,
          date: doc.data().date.toDate().toDateString(),
        } as PostsInterface)
    );

    // Get user liked posts
    let likedPosts: string[];
    if (isLoggedIn) {
      const docRef = doc(db, "users", userUID);
      const querySnapshot = await getDoc(docRef);
      likedPosts = querySnapshot.data()?.likedPosts;
    }

    const postsWithUserInfo: PostData[] = postsWithoutUserInfo.map((post) => {
      const matchingObject = usersInfo.find(
        (item) => item.id === post.createdBy
      );
      let hasLiked = null;
      if (isLoggedIn)
        if (likedPosts.includes(post.postId)) hasLiked = true;
        else hasLiked = false;

      return {
        ...post,
        hasLiked,
        username: matchingObject?.username,
        fullName: matchingObject?.fullName,
        photoURL: matchingObject?.photoURL,
      } as PostData;
    });
    console.log("Posts loading is called!");
    return postsWithUserInfo;
  }, [isLoggedIn, userUID]);

  const loadMorePosts = useCallback(async () => {
    console.log("More Posts loading is called!");
    setLoadingMorePosts(true);
    const q1 = query(
      collection(db, "posts"),
      orderBy("date", "desc"),
      startAfter(lastVisiblePost),
      limit(20)
    );

    const querySnapshot1 = await getDocs(q1);
    console.log(querySnapshot1.empty);
    if (querySnapshot1.empty) {
      setLoadingMorePosts(false);
      setMorePostsExist(false);
      return;
    }

    setLastVisiblePost(querySnapshot1.docs[querySnapshot1.docs.length - 1]);

    const usersUID = [
      ...new Set(querySnapshot1.docs.map((doc) => doc.data().createdBy)),
    ];
    const q2 = query(collection(db, "users"), where("uid", "in", usersUID));
    const querySnapshot2 = await getDocs(q2);
    const usersInfo = querySnapshot2.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      fullName: doc.data().fullName,
      photoURL: doc.data().photoURL || null,
    }));

    const postsWithoutUserInfo: PostsInterface[] = querySnapshot1.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          postId: doc.id,
          date: doc.data().date.toDate().toDateString(),
        } as PostsInterface)
    );

    // Get user liked posts
    let likedPosts: string[];
    if (isLoggedIn) {
      const docRef = doc(db, "users", userUID);
      const querySnapshot = await getDoc(docRef);
      likedPosts = querySnapshot.data()?.likedPosts;
    }

    const postsWithUserInfo: PostData[] = postsWithoutUserInfo.map((post) => {
      const matchingObject = usersInfo.find(
        (item) => item.id === post.createdBy
      );
      let hasLiked = null;
      if (isLoggedIn)
        if (likedPosts.includes(post.postId)) hasLiked = true;
        else hasLiked = false;

      return {
        ...post,
        hasLiked,
        username: matchingObject?.username,
        fullName: matchingObject?.fullName,
        photoURL: matchingObject?.photoURL,
      } as PostData;
    });

    dispatch(setPosts(postsWithUserInfo));

    //dispatch
  }, [dispatch, isLoggedIn, lastVisiblePost, userUID]);

  useEffect(() => {
    async function getAndSetPosts() {
      const posts = (await getInitialPosts()) || [];
      dispatch(clearAllPosts());
      dispatch(setPosts(posts));
    }
    getAndSetPosts();
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
    async (id: string) => {
      // Not the best solution to handle if person clicks like button
      // But it works
      // If checking wouldn't exist then after non-stop like clicking the like count gets incorrect
      if (likingInProgress) {
        dispatch(setErrorMessage("Wait before liking again!"));
        dispatch(setIsSnackbarOpen(true));
        return;
      }
      try {
        setLikingInProgress(true);
        const batch = writeBatch(db);

        const docRef = doc(db, "users", userUID);
        const querySnapshot = await getDoc(docRef);
        const likedPosts = querySnapshot.data()?.likedPosts;
        console.log(likedPosts);

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

        await batch.commit();
        setLikingInProgress(false);
        dispatch(changePostInfoAfterLiking(id));
      } catch {
        dispatch(
          setErrorMessage("Error occurred while liking post. Try again later!")
        );
        dispatch(setIsSnackbarOpen(true));
      }
    },
    [dispatch, likingInProgress, userUID]
  );

  return (
    <Stack direction="column">
      {posts.map((post, i) => (
        <Post {...post} key={i} handleLikeClick={handleLikeClick} />
      ))}
    </Stack>
  );
}
