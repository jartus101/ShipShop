import Hashtag from '@/components/Hashtag'
import { hashtags } from '@/constants/hashtags'
import React from 'react'

export default function Hashtags() {
  return (
    <div className='space-y-2'>
        <span className='font-semibold text-neutral-500'>Hashtags</span>
        <ul className='flex gap-3 flex-wrap'>
            {hashtags.map(hashtag => (
                <Hashtag key={hashtag.route}  hashtag={hashtag} />
            ))}
        </ul>
    </div>
  )
}
