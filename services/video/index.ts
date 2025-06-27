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
    
    // Add optional subcategory
    if (data.subcategory) {
      formData.append('subcategory', data.subcategory);
    }
    
    // Add optional shopping fields
    if (data.price !== undefined) {
      formData.append('price', data.price.toString());
    }
    if (data.buyLink) {
      formData.append('buyLink', data.buyLink);
    }
    
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
  try {
    // Use simple client-side filtering to avoid Sanity query issues
    const videos = await getVideos();
    
    if (!videos || !Array.isArray(videos)) {
      console.error('getVideos returned invalid data:', videos);
      return [];
    }
    
    const filtered = videos.filter(video => {
      if (!video) return false;
      
      const caption = video.caption || '';
      const description = video.description || '';
      
      return caption.toLowerCase().includes(value.toLowerCase()) || 
             description.toLowerCase().includes(value.toLowerCase());
    });
    
    return filtered;
  } catch (error) {
    console.error('Error in searchVideos:', error);
    // Always return an empty array instead of throwing
    return [];
  }
}

export async function getLikedVideos() {
  try {
    console.log('Fetching liked videos via API...');
    const response = await fetch('/api/liked-videos');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const videos = await response.json();
    console.log('Fetched liked videos successfully:', videos.length);
    return videos as DetailedVideo[];
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    throw error;
  }
}