import { User } from "./user"

export type Comment = {
    _id: string,
    text: string,
    author: User
}