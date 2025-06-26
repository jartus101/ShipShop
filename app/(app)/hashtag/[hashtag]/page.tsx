import VideoList from '@/components/VideoList'
import { getHashtagVideos } from '@/services/video'
import React from 'react'
import { FaSlackHash } from 'react-icons/fa'

export default async function Page({ params: { hashtag }  }: { params: { hashtag: string } }) {
    console.log(hashtag)
    const videos = await getHashtagVideos(hashtag)
  return (
    <div className="space-y-24">
    <div className="flex items-center gap-20 border-b border-b-secondary pb-8 text-5xl">
      <div className='p-8 flex justify-center items-center bg-secondary rounded-full'>
        <FaSlackHash />
      </div>
      <div className='capitalize font-bold'>
        {hashtag}
      </div>
    </div>

    <div className="space-y-6">
      <span className="text-xl font-semibold text-neutral-400">
        {`${hashtag} videos`} - {videos.length} Videos
      </span>
      <VideoList videos={videos} />
    </div>
  </div>
  )
}
