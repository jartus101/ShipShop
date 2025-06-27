import { NextRequest, NextResponse } from 'next/server';
import { sanity } from '@/sanity/lib/client';
import { getAuthedUserId } from '@/services/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('Fetching liked videos for user:', userId);

    // First, get all like document IDs that belong to this user using direct ID patterns
    const likesQuery = `*[_type=='like' && _id >= "${userId}." && _id < "${userId}/"]{video._ref}`;
    const likes = await sanity.fetch(likesQuery);
    
    console.log('Found likes:', likes);

    if (!likes || likes.length === 0) {
      return NextResponse.json([]);
    }

    // Extract video IDs from the likes
    const videoIds = likes.map((like: any) => like.video._ref).filter(Boolean);
    
    if (videoIds.length === 0) {
      return NextResponse.json([]);
    }

    console.log('Video IDs from likes:', videoIds);

    // Now fetch the actual videos
    const videosQuery = `
      *[_type=='video' && _id in [${videoIds.map((id: string) => `"${id}"`).join(', ')}]]{
        ...,
        author->,
        'likes_count': count(*[_type=='like' && references(^._id)]),
        'comments_count': count(*[_type=='comment' && references(^._id)])
      } | order(_createdAt desc)
    `;
    
    const videos = await sanity.fetch(videosQuery);
    console.log('Fetched liked videos:', videos.length);

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch liked videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
