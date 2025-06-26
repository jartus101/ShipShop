"use client";

import { getAuthedUser } from "@/services/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useEffect } from "react";
import useAuth from "@/stores/auth";
import { Toaster } from "@/components/ui/toaster";

type Props = {
  children: React.ReactNode;
};
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export default function Providers(props: Props) {
  const { children } = props;
  const setAuth = useAuth((state) => state.setAuth);

  useEffect(() => {
    getAuthedUser().then((user) => {
      if (!user) return;
      setAuth(user);
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster />
      {children}
    </GoogleOAuthProvider>
  );
}
