"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submit:", { user, password });
    if (!user || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      console.log("Missing username or password");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
      });
      const data = await res.json();
      console.log("API response:", data);
      console.log("Response status:", res.status);
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบล้มเหลว");
        return;
      }
      localStorage.setItem("admin_token", data.token);
      router.replace("/dashboard/admin-dashboard");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md border border-black/10">
        <h2 className="text-2xl font-bold mb-8 text-center text-black">
          เข้าสู่ระบบผู้ดูแล
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-black">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              className="w-full border border-black/20 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder:text-gray-400"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-black">
              รหัสผ่าน
            </label>
            <input
              type="password"
              className="w-full border border-black/20 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded font-bold text-lg hover:bg-gray-900 transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <div className="mt-8 text-center">
          <a
            href="/admin-signup"
            className="text-black hover:underline font-medium"
          >
            สมัครสมาชิกผู้ดูแลระบบ
          </a>
        </div>
      </div>
    </div>
  );
}
