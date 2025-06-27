import { FaRegLaughBeam, FaTshirt } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { RiTreeLine } from "react-icons/ri";
import { IoGameControllerOutline, IoHome } from "react-icons/io5";
import { MdSpa, MdFitnessCenter } from "react-icons/md";
import { FaLaptop } from "react-icons/fa";
import { GiClothes } from "react-icons/gi";

export const hashtags = [
    { 
      label: "Fashion", 
      route: "/fashion", 
      icon: <FaTshirt />, 
      hashtag: "fashion",
      subcategories: ["outerwear", "pants", "shoes", "dresses", "accessories", "bags", "jewelry"]
    },
    { 
      label: "Tech", 
      route: "/tech", 
      icon: <FaLaptop />, 
      hashtag: "tech",
      subcategories: ["cameras", "computers", "headphones", "phones", "smartwatches", "tablets", "gaming-gear"]
    },
    { 
      label: "Beauty", 
      route: "/beauty", 
      icon: <MdSpa />, 
      hashtag: "beauty",
      subcategories: ["skincare", "makeup", "hair-care", "fragrance", "tools", "nails", "body-care"]
    },
    { 
      label: "Home", 
      route: "/home", 
      icon: <IoHome />, 
      hashtag: "home",
      subcategories: ["furniture", "decor", "kitchen", "bedding", "lighting", "organization", "plants"]
    },
    { 
      label: "Fitness", 
      route: "/fitness", 
      icon: <MdFitnessCenter />, 
      hashtag: "fitness",
      subcategories: ["workout-equipment", "supplements", "activewear", "yoga", "cardio", "strength", "recovery"]
    },
    { 
      label: "Gaming", 
      route: "/gaming", 
      icon: <IoGameControllerOutline />, 
      hashtag: "gaming",
      subcategories: ["consoles", "pc-gaming", "mobile-games", "accessories", "merchandise", "collectibles", "streaming"]
    },
    { 
      label: "Lifestyle", 
      route: "/lifestyle", 
      icon: <RiTreeLine />, 
      hashtag: "lifestyle",
      subcategories: ["travel", "books", "hobbies", "food", "wellness", "productivity", "entertainment"]
    },
  ];

// Helper function to get subcategories for a hashtag
export function getSubcategoriesForHashtag(hashtag: string): string[] {
  const hashtagData = hashtags.find(h => h.hashtag === hashtag);
  return hashtagData?.subcategories || [];
}

// Helper function to get formatted subcategory display name
export function formatSubcategory(subcategory: string): string {
  return subcategory.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
