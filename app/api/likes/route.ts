import { NextRequest, NextResponse } from 'next/server';
import { sanityWrite } from '@/sanity/lib/client';
import { getAuthedUserId } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const { videoId, hasLiked } = await request.json();
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const likeId = `${userId}.${videoId}`;
    console.log('Like operation via API:', { videoId, hasLiked, userId, likeId });

    if (hasLiked) {
      // Unlike - delete the like
      console.log('Deleting like:', likeId);
      await sanityWrite.delete(likeId);
    } else {
      // Like - create the like
      console.log('Creating like:', likeId);
      await sanityWrite.createIfNotExists({
        _type: "like",
        _id: likeId,
        video: { _ref: videoId }
      });
    }

    // Get updated count
    const query = `count(*[_type=="like" && video._ref=="${videoId}"])`;
    const count = await sanityWrite.fetch(query);

    console.log('Like operation completed successfully, new count:', count);
    
    return NextResponse.json({ 
      success: true, 
      hasLiked: !hasLiked,
      count
    });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json({ 
      error: 'Failed to update like',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
