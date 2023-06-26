import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase/firebase";

export const getUsersInfo = async (usersUID: string[]) => {
  const q = query(collection(db, "users"), where("uid", "in", usersUID));
  const querySnapshot = await getDocs(q);
  const usersInfo = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    username: doc.data().username,
    fullName: doc.data().fullName,
    photoURL: doc.data().photoURL || null,
    information: doc.data().information,
    followersCount: doc.data().followers.length,
    followingCount: doc.data().following.length,
  }));
  return usersInfo;
};
export const getUserInfo = async (userUID: string) => {
  const docRef = doc(db, "users", userUID);
  const docSnap = await getDoc(docRef);
  const userInfo = {
    uid: docSnap.data()?.uid,
    username: docSnap.data()?.username,
    fullName: docSnap.data()?.fullName,
    photoURL: docSnap.data()?.photoURL || null,
    headerPhotoURL: docSnap.data()?.headerPhotoURL || null,
    information: docSnap.data()?.information,
    followersCount: docSnap.data()?.followers.length,
    followingCount: docSnap.data()?.following.length,
    tweetsCount: docSnap.data()?.tweetsCount,
    creationDate: docSnap.data()?.creationDate,
    followers: docSnap.data()?.followers,
    following: docSnap.data()?.following,
    likedPosts: docSnap.data()?.likedPosts,
  };
  return userInfo;
};

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
}
