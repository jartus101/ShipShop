import React from 'react'
import { Input } from '../ui/input'
import { redirect } from 'next/navigation'

export default function Search() {
  const handleSearch = async (form: FormData) => {
    "use server"
    const value = form.get("query")
    redirect(`/search/${value}`)
  }
  return (
    <form action={handleSearch}>
        <Input type='search' placeholder='Search Videos and Accounts...' name='query' className='p-5 w-[300px]' />
    </form>
  )
}
