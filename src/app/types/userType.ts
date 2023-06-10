export interface UserInterface {
  uid: string;
  username: string;
  fullName: string;
  photoURL: string | null;
  headerPhotoURL: string | null;
  information: string;
  followers: number;
  following: number;
  tweetsCount: number;
}
