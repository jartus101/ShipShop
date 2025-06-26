"use client";
import { DetailedVideo, DetailedPost } from '@/types/video';
import { useState } from 'react';
import VideoList from './VideoList';
import TikTokVideoFeed from './TikTokVideoFeed';
import { FaList, FaPlay } from 'react-icons/fa';

type Props = {
  videos: DetailedVideo[];
};

// Helper function to convert videos to posts format
function videosToPostsAdapter(videos: DetailedVideo[]): DetailedPost[] {
  return videos.map(video => ({
    ...video,
    media_url: video.video_url,
    media_type: 'video' as const
  }));
}

export default function VideoFeedContainer({ videos }: Props) {
  const [isTikTokMode, setIsTikTokMode] = useState(true);
  const posts = videosToPostsAdapter(videos);

  if (isTikTokMode) {
    return (
      <>
        {/* Toggle button - positioned absolutely */}
        <button
          onClick={() => setIsTikTokMode(false)}
          className="fixed top-4 left-4 z-50 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white"
          aria-label="Switch to list view"
        >
          <FaList className="text-lg" />
        </button>
        
        {/* Full screen TikTok feed */}
        <div className="fixed inset-0 z-40">
          <TikTokVideoFeed posts={posts} />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Toggle button for list view */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsTikTokMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full transition-colors"
          aria-label="Switch to TikTok view"
        >
          <FaPlay className="text-sm" />
          <span>TikTok View</span>
        </button>
      </div>
      
      {/* Regular list view */}
      <VideoList videos={videos} />
    </>
  );
}
