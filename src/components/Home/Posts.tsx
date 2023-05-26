import { useEffect, useState } from "react";
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

export default function Posts() {
  interface PostData {
    username: string;
    fullName: string;
    photoURL: string;
    date: string;
    text: string;
    likes: number;
    comments: string[];
    postId: string;
    hasLiked: boolean | null;
  }
  const dispatch = useAppDispatch();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadMorePosts, setLoadMorePosts] = useState(false);
  const userUID = useAppSelector((state) => state.user.uid);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // TODO: add new post to posts array so user can see his new post immediately
  // TODO: change heart icon color after it is clicked
  // TODO: implement comments

  useEffect(() => {
    async function getPosts() {
      let q1;
      if (!lastVisiblePost) {
        q1 = query(collection(db, "posts"), orderBy("date", "desc"), limit(20));
      }
      if (lastVisiblePost && loadMorePosts) {
        q1 = query(
          collection(db, "posts"),
          orderBy("date", "desc"),
          startAfter(lastVisiblePost),
          limit(20)
        );
        setLoadMorePosts(false);
      }
      if (!q1) return;
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
        photoURL: doc.data().photoURL || undefined,
      }));

      interface PostsInterface {
        date: string;
        text: string;
        likes: number;
        comments: string[];
        createdBy: string;
        postId: string;
      }

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
        // Because of async isLoggedIn fetching (App.tsx) isLoggedIn changes and useEffect is called three times (development mode: 2 times)
        // so I reset posts
        setPosts([]);
        const docRef = doc(db, "users", userUID);
        const querySnapshot = await getDoc(docRef);
        likedPosts = querySnapshot.data()?.likedPosts;
        console.log(likedPosts);
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
      setPosts((currentPosts) => [...currentPosts, ...postsWithUserInfo]);
      console.log(postsWithUserInfo);
    }
    getPosts();
  }, [isLoggedIn, lastVisiblePost, loadMorePosts, userUID]);

  useEffect(() => {
    function onScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= scrollableHeight) {
        setLoadMorePosts(true);
      }
    }

    document.addEventListener("scroll", onScroll);

    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLikeClick(id: string) {
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
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.postId === id) {
            const updatedLikes = post.hasLiked
              ? post.likes - 1
              : post.likes + 1;
            return { ...post, likes: updatedLikes, hasLiked: !post.hasLiked };
          }
          return post;
        })
      );
    } catch {
      dispatch(
        setErrorMessage("Error occurred while liking post. Try again later!")
      );
      dispatch(setIsSnackbarOpen(true));
    }
  }

  return (
    <Stack direction="column">
      {posts.map((post, i) => (
        <Post {...post} key={i} handleLikeClick={handleLikeClick} />
      ))}
    </Stack>
  );
}
