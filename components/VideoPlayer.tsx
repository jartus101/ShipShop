"use client";
import { Video } from "@/types/video";
import React, { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";

type Props = {
  video: Video;
  isTikTokStyle?: boolean;
};
export default function VideoPlayer(props: Props) {
  const { video, isTikTokStyle = false } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
const [isPaused, setIsPaused] = useState(true)
  useEffect(() => {
    if(isPaused) {
        videoRef.current?.pause()
    } else {
        videoRef.current?.play()
    }
  }, [isPaused])
  
  const containerClasses = isTikTokStyle 
    ? "relative bg-black rounded-lg w-full h-full max-w-md max-h-[80vh] flex justify-center items-center cursor-pointer"
    : "relative bg-secondary rounded max-w-full max-h-[80vh] flex justify-center items-center aspect-[9/16]";
    
  const videoClasses = isTikTokStyle
    ? "object-cover w-full h-full rounded-lg"
    : "object-contain";
    
  return (
    <div onClick={() => setIsPaused(!isPaused)} className={containerClasses}>
      <video ref={videoRef} className={videoClasses} loop>
        <source src={video.video_url} />
        <div>Coundnt load the video</div>
      </video>
      <div
      className={`transition-all hover:opacity-100 ${isPaused ? 'opacity-100' : 'opacity-0'} z-10 bg-black/40 absolute inset-0 flex items-center justify-center`}
      >
        {isPaused ? <FaPlay className="text-4xl text-white drop-shadow-lg" /> : null}
      </div>
    </div>
  );
}
