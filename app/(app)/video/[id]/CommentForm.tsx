"use client"

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { createComment } from "@/services/comment";

const formSchema = z.object({
  text: z.string().min(1),
});

type Props = {
  videoId: string;
};

type FormSchema = z.infer<typeof formSchema>
export default function CommentForm({ videoId }: Props) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [isLoading, setIsLoading] = useState(false)
  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true)
    await createComment({ text: data.text, videoId })
    location.reload()
    setIsLoading(false)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center justify-between gap-3">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="grow">
              <FormControl>
                <Input
                  placeholder="Write a comment about the video..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
            Comment
        </Button>
      </form>
    </Form>
  );
}
