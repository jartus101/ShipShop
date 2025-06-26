import VideoList from "@/components/VideoList";
import { searchVideos } from "@/services/video";
import React from "react";

export default async function Page({
  params: { value },
}: {
  params: { value: string };
}) {
  const videos = await searchVideos(value);
  return (
    <div className="space-y-24">
      <div className="flex items-center gap-20 border-b border-b-secondary pb-8 text-5xl capitalize font-bold">
            RESULTS FOR *{value}* SEARCH
      </div>

      <div className="space-y-6">
        <span className="text-xl font-semibold text-neutral-400">
          {videos.length} Videos
        </span>
        <VideoList videos={videos} />
      </div>
    </div>
  );
}
