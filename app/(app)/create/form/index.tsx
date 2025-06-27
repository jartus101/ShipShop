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
import { hashtags, getSubcategoriesForHashtag, formatSubcategory } from "@/constants/hashtags";
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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  
  // Watch hashtag to update subcategory options
  const selectedHashtag = form.watch("hashtag");
  const subcategories = getSubcategoriesForHashtag(selectedHashtag);
  
  // Reset subcategory when hashtag changes
  React.useEffect(() => {
    form.setValue("subcategory", "");
  }, [selectedHashtag, form]);
  
  const onSubmit = async (data: FormSchema) => {
    console.log('Form submitted with data:', data);
    console.log('Media file:', mediaFile);
    console.log('Is logged in:', isLoggedIn);
    
    if (!mediaFile) return toast({ title: "Upload a video or photo first!" });
    if (!isLoggedIn)
      return toast({ title: "You must be logged in to post!" });
    
    setIsLoading(true);
    
    try {
      console.log('Calling createVideo...');
      const videoDoc = await createVideo({ ...data, video: mediaFile });
      console.log('createVideo result:', videoDoc);
      
      if (!videoDoc) {
        console.error('createVideo returned null/undefined');
        toast({ title: "An error occurred trying to upload the video!" });
        setIsLoading(false);
        return;
      }

      toast({ title: "Post Created Successfully" });
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
        <VideoForm onVideoChange={setMediaFile} />
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
        <FormField
          name="subcategory"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Subcategory</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory..." />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {formatSubcategory(subcategory)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="price"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Price (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="29.99" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="buyLink"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Buy Link (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/product" 
                  {...field}
                />
              </FormControl>
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
