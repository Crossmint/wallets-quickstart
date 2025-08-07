"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";

export function LoginButton() {
  const { login } = useAuth();

  return (
    <button
      className="flex items-center gap-2 py-2 px-3 rounded-full text-sm m-auto font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={login}
    >
      Login
      <Image src="/log-in.svg" alt="Login" width={16} height={16} />
    </button>
  );
}
