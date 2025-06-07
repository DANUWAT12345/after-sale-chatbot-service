"use client";

import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl flex flex-col items-center border border-gray-200">
        <div className="w-full flex flex-col items-center mb-8">
          <h1 className="text-gray-900 text-3xl font-extrabold tracking-tight mb-1">บริการบ้านแสนดี</h1>
          <h2 className="text-gray-700 text-2xl font-bold tracking-tight mb-2">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 text-md font-medium">ยินดีต้อนรับสู่บริการแชทบอทหลังการขาย</p>
        </div>
        <div className="w-full flex flex-col gap-8">
          {/* User Login Section */}
          <div className="w-full flex flex-col items-center mb-0 pb-0 border-b border-gray-200">
            <h3 className="text-gray-700 text-lg font-semibold mb-4">เข้าสู่ระบบสำหรับลูกบ้าน</h3>
            <button
              className="w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <span className="mr-2">
                {/* Google SVG icon */}
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/>
                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/>
                    <path fill="#FBBC05" d="M24 45c5.8 0 10.7-2.9 14-7.4l-6.5-5.3C29.7 34.7 27 36 24 36c-5.8 0-10.7-3.9-12.7-9.5l-7 5.4C6.6 41.1 14.2 45 24 45z"/>
                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z" opacity=".1"/>
                  </g>
                </svg>
              </span>
              <span className="font-medium">เข้าสู่ระบบด้วย Google</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => window.location.href = '/api/auth/facebook'}
            >
              <span className="mr-2">
                {/* Facebook SVG icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
                </svg>
              </span>
              <span className="font-medium">เข้าสู่ระบบด้วย Facebook</span>
            </button>
          </div>
          {/* Admin Login Section */}
          <div className="w-full mt-0 pt-0 flex flex-col items-center">
            <h3 className="text-gray-800 text-lg font-bold mb-2 mt-6">เข้าสู่ระบบสำหรับแอดมิน</h3>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onClick={() => window.location.href = '/login/admin-login'}
            >
              <span className="mr-2">
                {/* Admin SVG icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/></svg>
              </span>
              <span className="font-medium">เข้าสู่ระบบผู้ดูแลระบบ</span>
            </button>
          </div>
        </div>
        <div className="mt-8 w-full text-center text-red-600 text-xs opacity-80">
          © {new Date().getFullYear()} After-Sale Chatbot Service - All rights reserved.
        </div>
      </div>
    </div>
  );
}
