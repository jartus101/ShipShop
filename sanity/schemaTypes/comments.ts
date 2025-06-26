import { defineField, defineType } from "sanity";

export const commentType = defineType({
    title: "Comment",
    name: "comment",
    type: "document",
    fields: [
        defineField({
            title: "Text",
            name: "text",
            type: "string"
        }),
        defineField({
            title: "Video",
            name: "video",
            type: "reference",
            to: [{ type: "video" }]
        }),
        defineField({
            title: "Author",
            name: "author",
            type: "reference",
            to: [{ type: "user" }]
        }),
    ]
})