"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FiHome } from "react-icons/fi";
import { TbVideo } from "react-icons/tb";
export default function Links() {
  const path = usePathname();
  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link.route} className="cursor-pointer">
          <Link href={link.route}>
            <div
              className={`flex items-center gap-4 text-2xl p-4 rounded hover:font-semibold hover:text-primary transition-all
                ${path === link.route ? "bg-primary/5 text-primary font-semibold" : ""}
                `}
            >
              {link.icon}
              {link.label}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const links = [
  { route: "/", label: "Home", icon: <FiHome /> },
  { route: "/create", label: "Create", icon: <TbVideo /> },
];
