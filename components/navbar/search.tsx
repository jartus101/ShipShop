import React from 'react'
import { Input } from '../ui/input'
import { searchAction } from '@/actions/search'

export default function Search() {
  return (
    <form action={searchAction}>
        <Input type='search' placeholder='Search Videos and Accounts...' name='query' className='p-5 w-[300px]' />
    </form>
  )
}
