import { FormSchema } from "@/app/(app)/create/form/schema";
import { sanity } from "@/sanity/lib/client";
import { getAuthedUserId } from "../auth";
import { DetailedVideo, Video } from "@/types/video";

type Data = {
  video: File;
} & FormSchema;
export async function createVideo(data: Data) {
  const videoAsset = await sanity.assets.upload("file", data.video);
  const videoUrl = videoAsset.url;
  const userId = await getAuthedUserId();

  if (!userId || !videoUrl) return;
  const doc = {
    _type: "video",
    caption: data.caption,
    description: data.description,
    hashtag: data.hashtag,
    video_url: videoUrl,
    author: { _ref: userId } as unknown,
  };
  const video = await sanity.create(doc);
  return video as Video;
}


export async function getVideo(id: string) {
  const query = `*[_type=='video' && _id=='${id}'][0]{
    ...,
    author->
  }`
  const video = await sanity.fetch(query)
  return video as Video
}

export async function getVideos() {
  const query = `
  *[_type=='video']{
  ...,
  author->,
    'likes_count': count(*[_type=='like' && references(^._id)]),
    'comments_count': count(*[_type=='comment' && references(^._id)])
} | order(_createdAt desc)
 `
  const videos = await sanity.fetch(query)
  return videos as DetailedVideo[]
}

export async function getUserVideos(userId: string) {
  const query = `
  *[_type=='video' && author._ref=='${userId}']{
  ...,
  author->,
    'likes_count': count(*[_type=='like' && references(^._id)]),
    'comments_count': count(*[_type=='comment' && references(^._id)])
} | order(_createdAt desc)
 `
  const videos = await sanity.fetch(query)
  return videos as DetailedVideo[]
}

export async function getHashtagVideos(hashtag: string) {
  const query = `
  *[_type=='video' && hashtag=='${hashtag}']{
  ...,
  author->,
    'likes_count': count(*[_type=='like' && references(^._id)]),
    'comments_count': count(*[_type=='comment' && references(^._id)])
} | order(_createdAt desc)
 `
  const videos = await sanity.fetch(query)
  return videos as DetailedVideo[]
}

export async function searchVideos(value: string) {
  const videos = await getVideos()
  return videos.filter(video => video.caption.toLowerCase().includes(value) || video.description.toLowerCase().includes(value))
}