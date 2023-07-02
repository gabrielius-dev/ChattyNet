import React from "react";

type type =
  | "post/like"
  | "post/comment"
  | "post/creation"
  | "comment/like"
  | "profile/follow";

export interface NotificationInterface {
  byUser: string;
  elementId: string | null;
  forUser: string;
  type: type;
  notificationId: string;
  date: string;
}

export interface NotificationData {
  username: string;
  fullName: string;
  photoURL: string | null;
  elementId: string;
  information: string;
  following: number;
  followers: number;
  notificationId: string;
  type: type;
  forUser: string;
  date: string;
}

type handleDeleteType = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  id: string
) => void;

export interface NotificationComponentArguments {
  notificationId: string;
  username: string;
  fullName: string;
  photoURL: string | null;
  elementId: string;
  information: string;
  following: number;
  followers: number;
  handleDelete: handleDeleteType;
  type: type;
  date: string;
}
