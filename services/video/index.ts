import { FormSchema } from "@/app/(app)/create/form/schema";
import { sanity, sanityWrite } from "@/sanity/lib/client";
import { getAuthedUserId } from "../auth";
import { DetailedVideo, Video } from "@/types/video";

type Data = {
  video: File;
} & FormSchema;
export async function createVideo(data: Data) {
  try {
    console.log('Starting video upload...', data.video.name);
    
    const userId = await getAuthedUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Send everything to server-side API to avoid all CORS issues
    const formData = new FormData();
    formData.append('file', data.video);
    formData.append('caption', data.caption);
    formData.append('description', data.description || '');
    formData.append('hashtag', data.hashtag);
    formData.append('userId', userId);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error}`);
    }
    
    const result = await response.json();
    console.log('Video created successfully:', result);
    
    return result.video as Video;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
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