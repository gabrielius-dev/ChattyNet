import { Query, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../app/firebase/firebase";

// Define a function to check if a username is already taken
export async function isUsernameTaken(username: string) {
  const usersRef = collection(db, "usernames");
  const q: Query = query(usersRef, where("username", "==", username));
  const matchingDocs = await getDocs(q);
  if (matchingDocs.size > 0) {
    // The username is already taken
    return true;
  }
  return false;
}
