import { Video } from "@/types/video";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Hashtag from "./Hashtag";

type Props = {
  video: Video;
};
export default function VideoInfo({ video }: Props) {
  return (
    <div className="space-y-4 ">
      <div className="flex items-center gap-2 p-2">
        <Image
          src={video.author.picture_url}
          width={50}
          height={50}
          alt="Author avatar"
          className="rounded-full"
        />
        <Link className="hover:underline" href={`/user/${video.author._id}`}>
            {video.author.name}
        </Link>
      </div>

      <Hashtag hashtag={video.hashtag} />
      <span className="font-bold text-4xl block">{video.caption}</span>
      <span className="text-xl text-neutral-500">{video.description}</span>
    </div>
  );
}
