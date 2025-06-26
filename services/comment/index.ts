"use server"

import { sanity } from "@/sanity/lib/client"
import { getAuthedUserId } from "../auth"
import { Comment } from "@/types/comment"

type Data =  {
    videoId: string,
    text: string
}
export async function createComment(data: Data) {
    const userId = await getAuthedUserId()
    if(!userId) return 
    const doc = {
        _type: "comment",
        author: { _ref: userId },
        video: { _ref: data.videoId },
        text: data.text
    }
    await sanity.create(doc)

    //remove the validate
}

export async function getComments(videoId: string) {
    const query = `*[_type=='comment' && video._ref=='${videoId}']{
    ...,
    author->
    } | order(_createdAt desc)`
    const comments = await sanity.fetch(query)
    return comments as Comment[]
}
export async function hasUserCommented(comments: Comment[]) {
    const userId = await getAuthedUserId()
    if(!userId) return 
    return comments.some(c => c.author._id === userId)
}