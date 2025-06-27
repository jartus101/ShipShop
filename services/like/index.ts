import { sanity } from "@/sanity/lib/client"
import { getAuthedUserId } from "../auth"

export async function getVideoLikesInfo(videoId: string) {
    const count = await getVideoLikeCount(videoId)
    const hasLiked = await hasUserLikedVideo(videoId)
    return { count, hasLiked }
}

async function hasUserLikedVideo(videoId: string) {
    const userId = await getAuthedUserId()
    if(!userId) return 
    const likeId = `${userId}.${videoId}`
    const query = `count(*[_type=="like" && _id=="${likeId}"]) > 0`
    const hasLiked = await sanity.fetch(query) as boolean
    return hasLiked
}

export async function getVideoLikeCount(videoId: string) {
    const query = `count(*[_type=="like" && video._ref=="${videoId}"])`
    const count = await sanity.fetch(query)
    return count
}

export async function likeOrDislikeVideo(videoId: string, hasLiked: boolean) {
    try {
        console.log('Toggling like via API...');
        const response = await fetch('/api/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoId, hasLiked }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Like toggled successfully:', result);
        return result;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

export async function getMultipleVideoLikesInfo(videoIds: string[]) {
    try {
        console.log('Loading like status for', videoIds.length, 'videos...');
        
        // For now, use individual queries to ensure reliability
        const result: Record<string, { count: number; hasLiked: boolean }> = {};
        
        for (const videoId of videoIds) {
            try {
                const info = await getVideoLikesInfo(videoId);
                result[videoId] = {
                    count: info?.count || 0,
                    hasLiked: info?.hasLiked || false
                };
            } catch (error) {
                console.error(`Error loading like info for video ${videoId}:`, error);
                result[videoId] = { count: 0, hasLiked: false };
            }
        }

        console.log('Batch like info loaded for', videoIds.length, 'videos');
        console.log('Sample like statuses:', Object.entries(result).slice(0, 3));
        return result;
    } catch (error) {
        console.error('Error fetching multiple video likes info:', error);
        // Return default state on error
        return videoIds.reduce((acc, videoId) => {
            acc[videoId] = { count: 0, hasLiked: false };
            return acc;
        }, {} as Record<string, { count: number; hasLiked: boolean }>);
    }
}