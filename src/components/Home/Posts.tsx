import { useEffect, useState } from "react";
import Post from "./Post";
import { Stack } from "@mui/material";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../../app/firebase/firebase";

export default function Posts() {
  interface PostData {
    username: string;
    fullName: string;
    photoURL: string;
    date: string;
    text: string;
    likes: number;
    comments: string[];
  }
  const [posts, setPosts] = useState<PostData[]>([]);
  const [lastVisiblePost, setLastVisiblePost] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadMorePosts, setLoadMorePosts] = useState(false);

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
      }

      const postsWithoutUserInfo: PostsInterface[] = querySnapshot1.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            date: doc.data().date.toDate().toDateString(),
          } as PostsInterface)
      );
      const postsWithUserInfo: PostData[] = postsWithoutUserInfo.map((post) => {
        const matchingObject = usersInfo.find(
          (item) => item.id === post.createdBy
        );
        return {
          ...post,
          username: matchingObject?.username,
          fullName: matchingObject?.fullName,
          photoURL: matchingObject?.photoURL,
        } as PostData;
      });
      setPosts((currentPosts) => [...currentPosts, ...postsWithUserInfo]);
    }
    getPosts();
  }, [lastVisiblePost, loadMorePosts]);

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

  return (
    <Stack direction="column">
      {posts.map((post, i) => (
        <Post {...post} key={i} />
      ))}
    </Stack>
  );
}
