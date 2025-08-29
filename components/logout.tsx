"use client";

import { useStytch } from "@stytch/nextjs";
import Image from "next/image";
import { useCallback } from "react";

export function LogoutButton() {
  const stytch = useStytch();

  const logout = useCallback(() => {
    stytch.session.revoke();
  }, [stytch]);


  return (
    <button
      className="flex items-center gap-2 py-2 px-3 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={logout}
    >
      Log out
      <Image src="/log-out.svg" alt="Logout" width={16} height={16} />
    </button>
  );
}
