"use client";

import React, { useState } from "react";

export default function AdminSignupPage() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    tel: "",
    username: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/admin-user/signup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to register admin user");
      setSubmitted(true);
    } catch {
      alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl flex flex-col items-center border border-gray-200">
        <h1 className="text-gray-900 text-3xl font-extrabold tracking-tight mb-1">
          Admin Sign Up
        </h1>
        <h2 className="text-gray-700 text-xl font-bold tracking-tight mb-6">
          สร้างบัญชีผู้ดูแลระบบ
        </h2>
        {submitted ? (
          <div className="text-green-600 font-semibold text-center">
            สมัครสมาชิกสำเร็จ!
          </div>
        ) : (
          <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-1"
              >
                ชื่อ-นามสกุล
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-gray-700 font-medium mb-1"
              >
                ตำแหน่ง
              </label>
              <input
                id="role"
                name="role"
                type="text"
                required
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="กรอกตำแหน่ง"
              />
            </div>
            <div>
              <label
                htmlFor="tel"
                className="block text-gray-700 font-medium mb-1"
              >
                เบอร์โทรศัพท์
              </label>
              <input
                id="tel"
                name="tel"
                type="tel"
                required
                value={form.tel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="กรอกเบอร์โทรศัพท์"
                pattern="[0-9]{10,15}"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="กรอก Username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="กรอก Password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              สมัครสมาชิก
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
