"use client";
import React from 'react';
import { GoogleLogin } from "@react-oauth/google";
import { auth } from "@/services/auth";
import useAuth from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbLogout } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Form from "../app/(app)/create/form";

export default function TikTokCreatePage() {
  const router = useRouter();
  
  // Auth state
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const logout = useAuth((state) => state.logout);
  const authedUser = useAuth((state) => state.user);
  const setAuth = useAuth((state) => state.setAuth);
  const { toast } = useToast();

  const onLoginSuccess = async (res: { credential?: string }) => {
    if (!res.credential) return;
    const user = await auth(res.credential);
    if (!user) return;
    setAuth(user);
    toast({ title: `Logged in as ${user.email}` });
  };

  const handleForYouClick = () => {
    router.push('/');
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Tab switcher at the top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-black/70 backdrop-blur-sm rounded-full p-1">
        <button 
          onClick={handleForYouClick}
          className="px-6 py-2 rounded-full text-white font-medium text-sm hover:bg-white/20 transition-colors"
        >
          For You
        </button>
        <button 
          className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm transition-colors"
          disabled
        >
          Create
        </button>
      </div>

      {/* Create new post bubble - centered */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Create New Post</h1>
          <Form />
        </div>
      </div>

      {/* Login/Profile section - top right corner */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3">
        {isLoggedIn && authedUser ? (
          <div className="flex items-center gap-3 text-white">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authedUser.picture_url} />
              <AvatarFallback className="text-xs">
                {authedUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{authedUser.name}</span>
              <button
                onClick={logout}
                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
              >
                <TbLogout className="text-xs" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white">
            <div className="text-sm mb-2 font-medium">Sign in to create posts</div>
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={() => toast({ title: "Login failed", variant: "destructive" })}
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
}
