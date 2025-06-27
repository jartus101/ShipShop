import { createClient } from 'next-sanity'
import { NextRequest, NextResponse } from 'next/server'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const token = process.env.SANITY_TOKEN || process.env.NEXT_PUBLIC_SANITY_TOKEN || ""

// Server-side client (no CORS issues)
const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    console.log('Server: Deleting post with ID:', postId)

    // Delete the post from Sanity
    const result = await sanityClient.delete(postId)
    console.log('Server: Post deleted successfully:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully',
      deletedId: postId
    })

  } catch (error) {
    console.error('Server: Delete error', error)
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Server: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Delete failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    )
  }
}
