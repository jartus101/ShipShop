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
    if (!video) return toast({ title: "Upload a video first!" });
    if (!isLoggedIn)
      return toast({ title: "You must be logged in to post a video!" });
    setIsLoading(true);
    const videoDoc = await createVideo({ ...data, video: video });
    if (!videoDoc)
      return toast({ title: "An error occurerd trying to upload the video!" });

    toast({ title: "Video Created Successfully" });
    router.push(`/video/${videoDoc._id}`);
    setIsLoading(false);
  };
  return (
    <FormComp {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:grid md:grid-cols-2 gap-3 w-full max-w-[750px] mx-auto"
      >
        <VideoForm onVideoChange={setVideo} />
        <FormField
          name="caption"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
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
              <FormLabel>Caption</FormLabel>
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
                <FormLabel>Description</FormLabel>
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
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </div>
      </form>
    </FormComp>
  );
}
