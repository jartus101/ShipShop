export const revalidate = 0

import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import { getVideo } from "@/services/video";
import React from "react";
import LikeButton from "./LikeButton";
import { AiFillMessage } from "react-icons/ai"
import { IoMdShare } from "react-icons/io"
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { getComments, hasUserCommented } from "@/services/comment";

type Props = {
  params: { id: string };
};
export default async function Page({ params: { id } }: Props) {
  const video = await getVideo(id);
  //pass the comments as props to <CommentList />
  const comments = await getComments(id)
  const hasCommented = await hasUserCommented(comments)
  return (
    <div className="flex flex-col gap-4 md:flex-row h-full">
      <VideoPlayer video={video} />
      <div className="flex flex-col justify-between w-full overflow-auto">
        <div className="border-secondary flex flex-col gap-4  p-6">
          <VideoInfo video={video} />
        </div>
        <div className="bg-secondary h-[1px]" />

        <div className="p-6 space-y-12">
          <div className="flex items-center gap-2">
            <LikeButton videoId={id} />
            <VideoButton icon={<AiFillMessage />} count={comments.length} active={hasCommented} />
            <VideoButton icon={<IoMdShare />} />
          </div>
        </div>

        <CommentList comments={comments} />
        <CommentForm videoId={id} />
      </div>
    </div>
  );
}

export function VideoButton({
  icon,
  count,
  active,
  type
}: {
  icon: React.ReactNode;
  count?: number;
  active?: boolean;
  type?: "button" | "submit"
} ) {
  const showCounter = !Number.isNaN(count);
  return (
    <button
    type={type || "button"}
      className={` ${showCounter ? "flex items-center gap-1 text-xl" : "text-2xl"} p-3 bg-secondary rounded-full hover:bg-secondary/50`}
    >
      <span className={`${active ? "text-primary" : ""}`}>{icon}</span>
      {showCounter ? <span className="text-white">{count}</span> : null}
    </button>
  );
}
