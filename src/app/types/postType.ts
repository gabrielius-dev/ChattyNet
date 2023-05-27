export interface PostData {
  username: string;
  fullName: string;
  photoURL: string | null;
  date: string;
  text: string;
  likes: number;
  comments: string[];
  postId: string;
  hasLiked: boolean | null;
}

export interface PostsInterface {
  date: string;
  text: string;
  likes: number;
  comments: string[];
  createdBy: string;
  postId: string;
}

type handleLikeClickType = (id: string) => void;

export interface PostComponentArguments {
  photoURL: string | null;
  fullName: string;
  username: string;
  date: string;
  text: string;
  likes: number;
  comments: string[];
  postId: string;
  handleLikeClick: handleLikeClickType;
  hasLiked: boolean | null;
}
