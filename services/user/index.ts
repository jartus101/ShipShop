import { sanity } from "@/sanity/lib/client";
import { Decoded } from "../auth";
import { User } from "@/types/user";

export async function createUser(decodedUser: Decoded) {
    const doc = {
        _type: "user",
        _id: decodedUser.sub,
        name: decodedUser.name,
        email: decodedUser.email,
        picture_url: decodedUser.picture
    }
    const user = await sanity.createIfNotExists(doc)
    return user as User
}

export async function getLatestUsers() {
    const query = `*[_type=="user"][0...3] | order(_createdAt desc)`
    const res = await sanity.fetch(query)
    return res as User[]
}

export async function getUserById(id: string) {
    const query = `*[_type=="user" && _id=="${id}"][0]`
    const user = await sanity.fetch(query)
    return user
}