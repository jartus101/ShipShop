import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLatestUsers } from "@/services/user";
import Link from "next/link";
import React from "react";

export default async function Profiles() {
  const profiles = await getLatestUsers();
  return (
    <div className="space-y-2">
      <span className="font-semibold text-neutral-500">Latest Users</span>
      <ul className="space-y-2">
        {profiles.map((profile) => (
          <Link
            href={`/user/${profile._id}`}
            key={profile._id}
            className="flex items-center gap-2 p-2 w-full h-full hover:bg-secondary bg-secondary/50 rounded"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.picture_url} />
              <AvatarFallback className="uppercase">
                {profile.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold">{profile.name}</span>
          </Link>
        ))}
      </ul>
    </div>
  );
}
