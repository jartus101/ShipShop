"use client";

import React, { useState } from "react";
import {
  Form as FormComp,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { formSchema, FormSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { hashtags } from "@/constants/hashtags";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import VideoForm from "./videoForm";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/stores/auth";
import { createVideo } from "@/services/video";
import { useRouter } from "next/navigation";

export default function Form() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hashtag: hashtags[0].hashtag,
    },
  });
  const router = useRouter();
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [video, setVideo] = useState<File | null>(null);
  
  const onSubmit = async (data: FormSchema) => {
    console.log('Form submitted with data:', data);
    console.log('Video file:', video);
    console.log('Is logged in:', isLoggedIn);
    
    if (!video) return toast({ title: "Upload a video first!" });
    if (!isLoggedIn)
      return toast({ title: "You must be logged in to post a video!" });
    
    setIsLoading(true);
    
    try {
      console.log('Calling createVideo...');
      const videoDoc = await createVideo({ ...data, video: video });
      console.log('createVideo result:', videoDoc);
      
      if (!videoDoc) {
        console.error('createVideo returned null/undefined');
        toast({ title: "An error occurred trying to upload the video!" });
        setIsLoading(false);
        return;
      }

      toast({ title: "Video Created Successfully" });
      console.log('Navigating to video page:', `/video/${videoDoc._id}`);
      router.push(`/video/${videoDoc._id}`);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive" 
      });
      setIsLoading(false);
    }
  };
  return (
    <FormComp {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:grid md:grid-cols-2 gap-3 w-full max-w-[750px] mx-auto text-black"
        onInvalid={(e) => console.log('Form validation failed:', e)}
      >
        <VideoForm onVideoChange={setVideo} />
        <FormField
          name="caption"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Caption</FormLabel>
              <FormControl>
                <Input placeholder="The caption for the video..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="hashtag"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Hashtag</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {hashtags.map((hashtag) => (
                    <SelectItem key={hashtag.hashtag} value={hashtag.hashtag}>
                      <div className="flex items-center gap-1">
                        {hashtag.icon}
                        {hashtag.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    placeholder="Give some more info about the video..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? "Uploading..." : "Submit"}
          </Button>
        </div>
      </form>
    </FormComp>
  );
}
