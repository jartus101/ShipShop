"use client"

import { z } from "zod"

const formSchema = z.object({
    caption: z.string().min(5).max(50),
    description: z.string().min(10).max(50).optional(),
    hashtag: z.string()
})

export type FormSchema = z.infer<typeof formSchema>

export { formSchema }