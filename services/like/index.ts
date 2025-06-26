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
    const userId = await getAuthedUserId()
    if(!userId) return 
    const likeId = `${userId}.${videoId}`
    if(hasLiked) {
        await sanity.delete(likeId)
    } else {
        await sanity.createIfNotExists({
            _type: "like",
            _id: likeId,
            video: { _ref: videoId }
        })
    }
}