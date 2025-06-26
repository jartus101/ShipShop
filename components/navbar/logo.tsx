import Link from 'next/link'
import React from 'react'
import { PiMusicNote } from 'react-icons/pi'

export default function Logo() {
  return (
    <Link href="/" className='flex items-center font-black text-3xl gap-0.5 group'>
        <PiMusicNote />
        <p><span className='text-primary'>TIK</span>TIK</p>
    </Link>
  )
}
