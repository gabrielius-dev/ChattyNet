import React from "react";

export interface PostInterface {
  date: string;
  text: string;
  likes: number;
  commentsCount: number;
  createdBy: string;
  postId: string;
}

export interface PostData {
  createdBy: string;
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

type handleLikeClickType = (id: string, postCreatorUID: string) => void;
type handleDeleteType = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  id: string
) => void;
type handleBookmarkClickType = (id: string) => void;

export interface PostComponentArguments {
  createdBy: string;
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
  createdBy: string;
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
  createdBy: string;
  photoURL: string | null;
  fullName: string;
  username: string;
  date: string;
  text: string;
  likes: number;
  handleLikeClick: handleLikeClickType;
  handleDelete: handleDeleteType;
  hasLikedComment: boolean | null;
  commentId: string;
  information: string;
  following: number;
  followers: number;
}
