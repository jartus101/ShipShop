import { User } from "./user"

export type Video = {
    _id: string,
    caption: string, 
    description: string, 
    video_url: string,
    hashtag: string 
    author: User
}

export type DetailedVideo = Video & { likes_count: number, comments_count: number }