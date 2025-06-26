import { hashtags } from "@/constants/hashtags";
import Link from "next/link";
import React from "react";

type Props = {
  hashtag: { label: string; route: string; icon: React.ReactNode } | string;
};
export default function Hashtag(props: Props) {
  const { hashtag: h } = props;
  const hashtag =
    typeof h === "string"
      ? hashtags.find((hashtag) => hashtag.hashtag === h)
      : h;
  if (!hashtag) return null;
  return (
    <Link href={`/hashtag/${hashtag.route}`}>
      <div className="w-fit flex items-center gap-1 rounded-full border border-secondary hover:border-primary hover:bg-primary/5 transition-all px-3 py-2.5 font-semibold">
        <span>{hashtag.icon}</span>
        <span>{hashtag.label}</span>
      </div>
    </Link>
  );
}
