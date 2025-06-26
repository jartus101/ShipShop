"use client"

import { z } from "zod"

const formSchema = z.object({
    caption: z.string().min(5, "Caption must be at least 5 characters").max(50, "Caption must be less than 50 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(50, "Description must be less than 50 characters"),
    hashtag: z.string().min(1, "Please select a hashtag")
})

export type FormSchema = z.infer<typeof formSchema>

export { formSchema }