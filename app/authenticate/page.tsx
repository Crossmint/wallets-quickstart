"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStytch, useStytchUser } from "@stytch/nextjs";

export default function Authenticate() {
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (stytch && !user && isInitialized) {
      const tokenType = searchParams.get("stytch_token_type");
      const token = searchParams.get("token");
      if (token && tokenType === "magic_links") {
        stytch.magicLinks.authenticate(token as string, {
          session_duration_minutes: 60,
        });
      }

      if (token && tokenType === "oauth") {
        stytch.oauth.authenticate(token as string, {
          session_duration_minutes: 60,
        });
      }
    }
  }, [isInitialized, searchParams, stytch, user]);

  useEffect(() => {
    if (isInitialized) {
      // Redirect the user to an authenticated page if they are already logged in
      router.replace("/");
    }
  }, [user, isInitialized, router]);
}
