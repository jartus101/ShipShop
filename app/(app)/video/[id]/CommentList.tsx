import { Comment } from "@/types/comment";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  comments: Comment[];
};
export default function CommentList({ comments }: Props) {
  return (
    <ul className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden">
      {comments.map((comment) => (
        <li className="space-y-1" key={comment._id}>
          <div className="flex items-center gap-2">
            <Image
              src={comment.author.picture_url}
              width={30}
              height={30}
              alt="Author Avatar"
              className="rounded-full"
            />
            <Link href={`/user/${comment.author._id}`}>
              {comment.author.name}
            </Link>
          </div>
          <p className="bg-secondary/10 px-4 py-1.5 rounded">{comment.text}</p>
        </li>
      ))}
    </ul>
  );
}
