import { createClient } from 'next-sanity'
import { NextRequest, NextResponse } from 'next/server'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const token = process.env.SANITY_TOKEN || process.env.NEXT_PUBLIC_SANITY_TOKEN || ""

console.log('Server: Sanity config:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token,
  tokenPrefix: token ? token.substring(0, 8) + '...' : 'none'
})

// Server-side client (no CORS issues)
const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload API is working',
    config: {
      projectId,
      dataset,
      apiVersion,
      hasToken: !!token,
      tokenLength: token.length
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Server: API route called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    const description = formData.get('description') as string
    const hashtag = formData.get('hashtag') as string
    const userId = formData.get('userId') as string
    
    console.log('Server: Form data received:', {
      hasFile: !!file,
      caption,
      description,
      hashtag,
      userId,
      fileInfo: file ? { name: file.name, type: file.type, size: file.size } : null
    })
    
    if (!file) {
      console.log('Server: No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!caption || !hashtag || !userId) {
      console.log('Server: Missing required fields:', { caption: !!caption, hashtag: !!hashtag, userId: !!userId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Server: Uploading file', file.name, file.type, file.size)

    // Upload to Sanity from server-side (no CORS issues)
    console.log('Server: Starting Sanity asset upload...')
    const asset = await sanityClient.assets.upload('file', file, {
      filename: file.name,
      contentType: file.type,
    })

    console.log('Server: Upload successful', asset.url)

    // Create video document
    const doc = {
      _type: "video",
      caption,
      description: description || '',
      hashtag,
      video_url: asset.url,
      author: { _ref: userId, _type: "reference" },
    };

    console.log('Server: Creating video document', doc)
    const video = await sanityClient.create(doc)
    console.log('Server: Video document created', video)

    return NextResponse.json({ 
      success: true, 
      video: {
        _id: video._id,
        _type: video._type,
        caption: video.caption,
        description: video.description,
        hashtag: video.hashtag,
        video_url: video.video_url,
        author: video.author,
        _createdAt: video._createdAt,
        _updatedAt: video._updatedAt
      }
    })

  } catch (error) {
    console.error('Server: Upload/Create error', error)
    
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
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    )
  }
}
