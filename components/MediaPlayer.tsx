"use client";
import { DetailedPost } from "@/types/video";
import React, { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";

type Props = {
  post: DetailedPost;
  isTikTokStyle?: boolean;
};

export default function MediaPlayer(props: Props) {
  const { post, isTikTokStyle = false } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  
  useEffect(() => {
    if (post.media_type === 'video') {
      if(isPaused) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play();
      }
    }
  }, [isPaused, post.media_type]);
  
  const containerClasses = isTikTokStyle 
    ? "relative bg-black rounded-lg w-full h-full max-w-md max-h-[80vh] flex justify-center items-center cursor-pointer"
    : "relative bg-secondary rounded max-w-full max-h-[80vh] flex justify-center items-center aspect-[9/16]";
    
  const mediaClasses = isTikTokStyle
    ? "object-cover w-full h-full rounded-lg"
    : "object-contain";

  const handleClick = () => {
    if (post.media_type === 'video') {
      setIsPaused(!isPaused);
    }
  };
    
  return (
    <div onClick={handleClick} className={containerClasses}>
      {post.media_type === 'video' ? (
        <>
          <video ref={videoRef} className={mediaClasses} loop>
            <source src={post.media_url} />
            <div>Couldn&apos;t load the video</div>
          </video>
          <div
            className={`transition-all hover:opacity-100 ${isPaused ? 'opacity-100' : 'opacity-0'} z-10 bg-black/40 absolute inset-0 flex items-center justify-center`}
          >
            {isPaused ? <FaPlay className="text-4xl text-white drop-shadow-lg" /> : null}
          </div>
        </>
      ) : (
        <Image
          src={post.media_url}
          alt={post.caption || post.description}
          fill
          className={mediaClasses}
          style={{ objectFit: isTikTokStyle ? 'cover' : 'contain' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      )}
    </div>
  );
}
