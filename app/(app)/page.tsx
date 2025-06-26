export const revalidate = 0;
import VideoFeedContainer from "@/components/VideoFeedContainer";
import { getVideos } from "@/services/video";

export default async function Home() {
  const videos = await getVideos();
  return (
    <VideoFeedContainer videos={videos} />
  );
}
