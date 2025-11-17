"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const errorParam = searchParams.get("error");
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }

        await checkAuth();
        await new Promise((resolve) => setTimeout(resolve, 300));
        router.push("/dashboard");
      } catch (err) {
        console.error("Authentication failed:", err);
        setError("Authentication failed. Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    };

    authenticateUser();
  }, [checkAuth, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {error ? (
        <p className="text-lg text-red-500">{error}</p>
      ) : (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-lg">Logging you in, please wait...</p>
        </>
      )}
    </div>
  );
}
