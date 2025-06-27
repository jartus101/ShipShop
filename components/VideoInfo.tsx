import { Video, DetailedPost } from "@/types/video";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Hashtag from "./Hashtag";
import { formatSubcategory } from "@/constants/hashtags";

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

      <div className="flex items-center gap-2 flex-wrap">
        <Hashtag hashtag={data.hashtag} isTikTokStyle={isTikTokStyle} />
        {data.subcategory && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isTikTokStyle 
              ? 'bg-white/20 text-white backdrop-blur-sm' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {formatSubcategory(data.subcategory)}
          </span>
        )}
      </div>
      
      <span className={`font-bold text-2xl md:text-3xl block ${isTikTokStyle ? 'text-white drop-shadow-lg' : 'text-black'}`}>
        {data.caption}
      </span>
      
      {/* Shopping Information */}
      {(data.price || data.buyLink) && (
        <div className={`space-y-2 ${isTikTokStyle ? 'text-white' : 'text-gray-900'}`}>
          {data.price && (
            <div className={`text-xl font-semibold ${isTikTokStyle ? 'text-green-400 drop-shadow-lg' : 'text-green-600'}`}>
              ${data.price.toFixed(2)}
            </div>
          )}
          {data.buyLink && (
            <a 
              href={data.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-4 py-2 rounded-full font-semibold transition-colors ${
                isTikTokStyle 
                  ? 'bg-white text-black hover:bg-gray-200 drop-shadow-lg' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Shop Now
            </a>
          )}
        </div>
      )}
      
      <span className={`text-lg ${isTikTokStyle ? 'text-white/80 drop-shadow-lg' : 'text-gray-600'}`}>
        {data.description}
      </span>
    </div>
  );
}
