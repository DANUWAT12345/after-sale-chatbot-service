"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/login/admin-login");
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-2 text-lg">You do not have permission to access this page.</p>
        <p className="mb-4">Redirecting to login in <span className="font-bold">{countdown}</span> seconds...</p>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
          onClick={() => router.replace("/login/admin-login")}
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
}
