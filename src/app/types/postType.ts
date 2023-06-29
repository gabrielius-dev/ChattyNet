export interface PostInterface {
  date: string;
  text: string;
  likes: number;
  commentsCount: number;
  createdBy: string;
  postId: string;
}

export interface PostData {
  username: string;
  fullName: string;
  photoURL: string | null;
  date: string;
  text: string;
  likes: number;
  postId: string;
  commentsCount: number;
  hasLiked: boolean | null;
  hasBookmarked: boolean;
  information: string;
  following: number;
  followers: number;
}

type handleLikeClickType = (id: string) => void;
type handleBookmarkClickType = (id: string) => void;

export interface PostComponentArguments {
  photoURL: string | null;
  fullName: string;
  username: string;
  date: string;
  text: string;
  likes: number;
  postId: string;
  commentsCount: number;
  handleLikeClick: handleLikeClickType;
  handleBookmarkClick: handleBookmarkClickType;
  hasLiked: boolean | null;
  hasBookmarked: boolean;
  information: string;
  following: number;
  followers: number;
}

export interface CommentInterface {
  createdBy: string;
  text: string;
  date: string;
  likes: number;
  likedUsers: string[];
  commentId: string;
}

export interface CommentData {
  username: string;
  fullName: string;
  photoURL: string | null;
  date: string;
  text: string;
  hasLikedComment: boolean | null;
  likes: number;
  commentId: string;
  information: string;
  following: number;
  followers: number;
}

export interface CommentComponentArguments {
  photoURL: string | null;
  fullName: string;
  username: string;
  date: string;
  text: string;
  likes: number;
  handleLikeClick: handleLikeClickType;
  hasLikedComment: boolean | null;
  commentId: string;
  information: string;
  following: number;
  followers: number;
}
