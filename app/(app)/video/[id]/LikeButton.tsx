"use client";
import React, { useEffect, useState } from "react";
import { VideoButton } from "./page";
import { IoHeart } from "react-icons/io5";
import { getVideoLikesInfo, likeOrDislikeVideo } from "@/services/like";
import useAuth from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";

type Info = { count: number; hasLiked: boolean };
type Props = {
  videoId: string;
};
export default function LikeButton({ videoId }: Props) {
  const [likeInfo, setLikeInfo] = useState<Info>({ count: 0, hasLiked: false });
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const { toast } = useToast();
  useEffect(() => {
    getVideoLikesInfo(videoId).then((info) => setLikeInfo(info as Info));
  }, [isLoggedIn]);

  const handleLikeOrDislike = async () => {
    if (!isLoggedIn)
      return toast({ title: "You must be logged in to like the video" });
    let newCount = likeInfo.count;
    let newHasLiked = likeInfo.hasLiked;

    if (likeInfo.hasLiked) {
      newHasLiked = false;
      if (newCount >= 0) newCount = newCount - 1;
    } else {
      newHasLiked = true;
      newCount = newCount + 1;
    }
    setLikeInfo({ count: newCount, hasLiked: newHasLiked });
    await likeOrDislikeVideo(videoId, likeInfo.hasLiked);
  };
  return (
    <form action={handleLikeOrDislike}>
      <VideoButton
        type="submit"
        icon={<IoHeart />}
        count={likeInfo.count}
        active={likeInfo.hasLiked}
      />
    </form>
  );
}
