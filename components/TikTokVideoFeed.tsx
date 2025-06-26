"use client";
import { DetailedVideo } from '@/types/video';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import VideoInfo from './VideoInfo';
import { IoHeart } from "react-icons/io5";
import { AiFillMessage } from "react-icons/ai";
import { IoIosArrowUp, IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { GoogleLogin } from "@react-oauth/google";
import { auth } from "@/services/auth";
import useAuth from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbLogout } from "react-icons/tb";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  videos: DetailedVideo[];
};

export default function TikTokVideoFeed({ videos }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const router = useRouter();
  
  // Auth state
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const logout = useAuth((state) => state.logout);
  const authedUser = useAuth((state) => state.user);
  const setAuth = useAuth((state) => state.setAuth);
  const { toast } = useToast();

  const onLoginSuccess = async (res: { credential?: string }) => {
    if (!res.credential) return;
    const user = await auth(res.credential);
    if (!user) return;
    setAuth(user);
    toast({ title: `Logged in as ${user.email}` });
  };

  const handleCreateClick = () => {
    router.push('/create');
  };

  const goToNext = useCallback(() => {
    console.log('goToNext called');
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex < videos.length - 1 ? prevIndex + 1 : prevIndex;
      console.log('Setting new index from', prevIndex, 'to', newIndex);
      return newIndex;
    });
  }, [videos.length]);

  const goToPrevious = useCallback(() => {
    console.log('goToPrevious called');
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
      console.log('Setting new index from', prevIndex, 'to', newIndex);
      return newIndex;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          event.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swipe up - go to next video
        goToNext();
      } else {
        // Swipe down - go to previous video
        goToPrevious();
      }
    }

    // Reset touch positions
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  if (videos.length === 0) {
    return <div className="flex items-center justify-center h-screen text-xl">No videos available</div>;
  }

  const currentVideo = videos[currentIndex];
  console.log('TikTokVideoFeed render - currentIndex:', currentIndex, 'currentVideo:', currentVideo._id);

  return (
    <div 
      className="relative h-screen overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab switcher at the top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-black/70 backdrop-blur-sm rounded-full p-1">
        <button 
          className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm transition-colors"
          disabled
        >
          For You
        </button>
        <button 
          onClick={handleCreateClick}
          className="px-6 py-2 rounded-full text-white font-medium text-sm hover:bg-white/20 transition-colors"
        >
          Create
        </button>
      </div>

      {/* Full-screen video player */}
      <div className="w-full h-full flex items-center justify-center relative bg-black">
        <div className="relative w-full max-w-md h-full flex items-center justify-center">
          <VideoPlayer key={currentVideo._id} video={currentVideo} isTikTokStyle={true} />
        </div>
        
        {/* Video info overlay - bottom left */}
        <div className="absolute bottom-20 left-4 right-4 md:right-auto md:max-w-md">
          <VideoInfo key={currentVideo._id} video={currentVideo} isTikTokStyle={true} />
        </div>
        
        {/* Action buttons overlay - right side directly next to video */}
        <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 translate-x-60 flex flex-col space-y-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <IoHeart className="text-2xl text-white" />
            </div>
            <span className="text-white text-xs font-medium">{currentVideo.likes_count}</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <AiFillMessage className="text-2xl text-white" />
            </div>
            <span className="text-white text-xs font-medium">{currentVideo.comments_count}</span>
          </div>

          <Link 
            href={`/video/${currentVideo._id}`}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <IoIosArrowForward className="text-2xl text-white" />
          </Link>
        </div>
      </div>

      {/* Navigation buttons - positioned on the left side over the video */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
        {/* Up arrow */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full transition-all ${
            currentIndex === 0 
              ? 'bg-black/20 text-white/50 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-black/70 text-white cursor-pointer'
          }`}
          aria-label="Previous video"
        >
          <IoIosArrowUp className="text-2xl" />
        </button>

        {/* Video counter */}
        <div className="bg-black/50 rounded-full px-3 py-1 text-white text-sm font-medium">
          {currentIndex + 1} / {videos.length}
        </div>

        {/* Down arrow */}
        <button
          onClick={goToNext}
          disabled={currentIndex === videos.length - 1}
          className={`p-3 rounded-full transition-all ${
            currentIndex === videos.length - 1 
              ? 'bg-black/20 text-white/50 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-black/70 text-white cursor-pointer'
          }`}
          aria-label="Next video"
        >
          <IoIosArrowDown className="text-2xl" />
        </button>
      </div>

      {/* Login/Profile section - top right corner */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3">
        {isLoggedIn && authedUser ? (
          <div className="flex items-center gap-3 text-white">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authedUser.picture_url} />
              <AvatarFallback className="text-xs">
                {authedUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{authedUser.name}</span>
              <button
                onClick={logout}
                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
              >
                <TbLogout className="text-xs" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white">
            <div className="text-sm mb-2 font-medium">Sign in to like and comment</div>
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={() => toast({ title: "Login failed", variant: "destructive" })}
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
}
