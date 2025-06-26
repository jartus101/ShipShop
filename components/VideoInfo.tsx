import { Video, DetailedPost } from "@/types/video";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Hashtag from "./Hashtag";

type Props = {
  video?: Video;
  post?: DetailedPost;
};
export default function VideoInfo({ video, post, isTikTokStyle = false }: Props & { isTikTokStyle?: boolean }) {
  const data = post || video;
  if (!data) return null;
  
  return (
    <div className={`space-y-4 ${isTikTokStyle ? 'text-white' : ''}`}>
      <div className="flex items-center gap-2 p-2">
        <Image
          src={data.author.picture_url}
          width={50}
          height={50}
          alt="Author avatar"
          className={`rounded-full ${isTikTokStyle ? 'border-2 border-white/20' : 'border-2 border-gray-200'}`}
        />
        <Link 
          className={`hover:underline font-semibold ${isTikTokStyle ? 'text-white' : 'text-gray-900'}`} 
          href={`/user/${data.author._id}`}
        >
            {data.author.name}
        </Link>
      </div>

      <Hashtag hashtag={data.hashtag} isTikTokStyle={isTikTokStyle} />
      <span className={`font-bold text-2xl md:text-3xl block ${isTikTokStyle ? 'text-white drop-shadow-lg' : 'text-black'}`}>
        {data.caption}
      </span>
      <span className={`text-lg ${isTikTokStyle ? 'text-white/80 drop-shadow-lg' : 'text-gray-600'}`}>
        {data.description}
      </span>
    </div>
  );
}
