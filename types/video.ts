import { User } from "./user"

export type Video = {
    _id: string,
    caption: string, 
    description: string, 
    video_url: string,
    hashtag: string,
    subcategory?: string,
    price?: number,
    buyLink?: string,
    author: User
}

export type Post = {
    _id: string,
    caption: string, 
    description: string, 
    media_url: string,
    media_type: 'video' | 'image',
    hashtag: string,
    subcategory?: string,
    price?: number,
    buyLink?: string,
    author: User
}

export type DetailedVideo = Video & { likes_count: number, comments_count: number }
export type DetailedPost = Post & { likes_count: number, comments_count: number }