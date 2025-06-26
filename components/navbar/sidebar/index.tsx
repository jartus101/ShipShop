import React from "react";
import Links from "./links";
import Hashtags from "./hashtags";
import Profiles from "./profiles";

export default function Sidebar() {
  return (
    <div className="overflow-auto border-r p-8 max-w-[350px] space-y-12">
      <Links />
      <Hashtags />
      <Profiles />
    </div>
  );
}
