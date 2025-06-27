import { FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import React, { ChangeEvent, useRef, useState } from "react";
import { TbVideo, TbPhoto } from "react-icons/tb";

type Props = {
    onVideoChange: (file: File) => void
}
export default function VideoForm(props: Props) {
    const { onVideoChange } = props
  const { toast } = useToast();
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const onMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    const file = files?.[0];
    if (!file) return toast({ title: "Couldn't find any media file" });

    const fileSize = file.size / 1024 / 1024; // file size in Mb
    if (fileSize > 50) return toast({ title: "File is too big (max 50MB)" });

    // Determine if it's a video or image
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      return toast({ title: "Please upload a video or image file" });
    }

    if (mediaURL) {
      URL.revokeObjectURL(mediaURL);
      setMediaURL(null);
    }

    const url = URL.createObjectURL(file);
    setMediaURL(url);
    setMediaType(isVideo ? 'video' : 'image');
    onVideoChange(file);

    if(videoRef.current && isVideo) {
        videoRef.current.load();
    }
  };
  return (
    <>
      <FormLabel className="text-black">Video/Photo</FormLabel>
      <div className="col-span-2 relative min-h-[200px] border border-dashed border-secondary hover:border-primary">
        <label className="cursor-pointer">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center">
              <p className="text-xl font-semibold text-black">Upload Video/Photo</p>
              <div className="flex items-center gap-2 text-black text-2xl">
                <TbVideo />
                <span className="text-sm">/</span>
                <TbPhoto />
              </div>
            </div>
          </div>
          <input
            type="file"
            name="upload-media"
            accept=".mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.gif,.webp"
            className="w-0 h-0"
            onChange={onMediaUpload}
          />
        </label>
        {mediaURL && (
          <>
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                autoPlay
                controls={false}
                muted
                className="absolute inset-0 w-full h-full pointer-events-none object-cover"
              >
                <source src={mediaURL} />
              </video>
            ) : (
              <img
                src={mediaURL}
                alt="Uploaded content"
                className="absolute inset-0 w-full h-full pointer-events-none object-cover"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
