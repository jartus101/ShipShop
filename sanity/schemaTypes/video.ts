import { defineField, defineType } from "sanity";

export const videoType = defineType({
    title: "Video",
    name: "video",
    type: "document",
    fields: [
        defineField({
            title: "Caption",
            name: "caption",
            type: "string"
        }),
        defineField({
            title: "Author",
            name: "author",
            type: "reference",
            to: [{ type: "user" }]
        }),
        defineField({
            title: "Description",
            name: "description",
            type: "string"
        }),
        defineField({
            title: "Hashtag",
            name: "hashtag",
            type: "string"
        }),
        defineField({
            title: "Video URL",
            name: "video_url",
            type: "url"
        }),
    ]
})