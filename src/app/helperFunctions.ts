import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase/firebase";

export const getUsersInfo = async (usersUID: string[]) => {
  const q2 = query(collection(db, "users"), where("uid", "in", usersUID));
  const querySnapshot2 = await getDocs(q2);
  const usersInfo = querySnapshot2.docs.map((doc) => ({
    id: doc.id,
    username: doc.data().username,
    fullName: doc.data().fullName,
    photoURL: doc.data().photoURL || null,
  }));
  return usersInfo;
};

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
}
