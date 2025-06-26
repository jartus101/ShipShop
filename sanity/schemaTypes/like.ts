import { defineField, defineType } from "sanity";

export const likeType = defineType({
    title: "Like",
    name: "like",
    type: "document",
    fields: [
        defineField({
            title: "Video",
            name: "video",
            type: "reference",
            to: [{ type: "video" }]
        })
    ]
})