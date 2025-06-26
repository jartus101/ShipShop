import { DetailedVideo } from "@/types/video";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import VideoInfo from "./VideoInfo";
import { IoHeart } from "react-icons/io5";
import { AiFillMessage } from "react-icons/ai";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

export default function VideoCard({ video }: { video: DetailedVideo }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full transition-all border-b border-b-secondary">
      <VideoPlayer video={video} />
      <div className="flex fle-col justify-between w-full overflow-auto">
        <div className="border-secondary flex flex-col gap-4 h-full p-6">
          <VideoInfo video={video} />
          <div className="flex flex-col gap-4 font-semibold text-neutral-400 text-2xl border-t border-t-secondary pt-6">
            <div className="flex items-center gap-1.5">
              <IoHeart />
              <span>{video.likes_count} Likes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AiFillMessage />
              <span>{video.comments_count} Comments</span>
            </div>
            <Link href={`/video/${video._id}`} className="text-xl flex items-center gap-2 border border-secondary hover:bg-primary/10 hover:border-primary transition-all w-fit px-4 py-2.5 rounded-full">
              <span>See more details</span>
              <IoIosArrowForward />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
