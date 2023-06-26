export interface UserProfileInterface {
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
  creationDate: string | null;
  tweetsCount: number;
  likedPosts: string[];
}

export interface SmallUserInformationInterface {
  id: string;
  username: string;
  fullName: string;
  photoURL: string | null;
  information: string;
  followersCount: number;
  followingCount: number;
}
