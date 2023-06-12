import { Timestamp } from "firebase/firestore";

export interface UserInterface {
  uid: string;
  username: string;
  fullName: string;
  photoURL: string | null;
  headerPhotoURL: string | null;
  information: string;
  followersCount: number;
  followingCount: number;
  following: string[];
  followers: string[];
  creationDate: Timestamp;
  tweetsCount: number;
}
