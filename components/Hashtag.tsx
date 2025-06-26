import { hashtags } from "@/constants/hashtags";
import Link from "next/link";
import React from "react";

type Props = {
  hashtag: { label: string; route: string; icon: React.ReactNode } | string;
  isTikTokStyle?: boolean;
};
export default function Hashtag(props: Props) {
  const { hashtag: h, isTikTokStyle = false } = props;
  const hashtag =
    typeof h === "string"
      ? hashtags.find((hashtag) => hashtag.hashtag === h)
      : h;
  if (!hashtag) return null;
  
  const containerClasses = isTikTokStyle
    ? "w-fit flex items-center gap-1 rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all px-3 py-2.5 font-semibold text-white backdrop-blur-sm"
    : "w-fit flex items-center gap-1 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all px-3 py-2.5 font-semibold text-gray-800 bg-gray-50";
    
  return (
    <Link href={`/hashtag/${hashtag.route}`}>
      <div className={containerClasses}>
        <span>{hashtag.icon}</span>
        <span>{hashtag.label}</span>
      </div>
    </Link>
  );
}
