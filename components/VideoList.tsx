import { DetailedVideo } from '@/types/video'
import React from 'react'
import VideoCard from './VideoCard'

export default function VideoList({ videos }: {
    videos: DetailedVideo[]
}) {
  return (
    <ul>
        {videos.map(video => <VideoCard key={video._id} video={video} /> )}
    </ul>
  )
}
