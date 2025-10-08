
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";


export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword]= useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ee] relative">
      <div className="w-full max-w-md px-6 text-center">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {isSignIn ? "Sign in to your account" : "Sign up for free"}
        </h1>

        {/* Subtitle */}
        {!isSignIn && (
          <p className="text-gray-600 text-sm ">
            We recommend using your <strong>work email</strong> — it keeps work and life separate.
          </p>
        )}

        {/* Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log(isSignIn ? "Signing in..." : "Signing up...");
          }}
          className="flex flex-col items-center gap-4 mt-8"
        >
          {/* Username field for signup only */}
          {!isSignIn && (
            <div className="w-full text-left">
              <label htmlFor="username" className="text-sm text-gray-600 font-bold">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Your username"
                required
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Email field */}
          <div className="w-full text-left">
            <label htmlFor="email" className="text-sm text-gray-600 font-bold">
              Work email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password field */}
          <div className="w-full text-left relative">
            <label htmlFor="password" className="text-sm text-gray-600 font-bold">
              Password
            </label>
            <input
              id="password"
              type= {showPassword? "password": "text"}
              placeholder="••••••••"
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type = "button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute pt-6 inset-y-0 right-3 flex items-center text-black hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            {isSignIn ? "Sign in" : "Sign up"}
          </button>
        </form>

        {/* Switch Button using router */}
        <button
          onClick={() => router.push(isSignIn ? "/signup" : "/signin")}
          className="w-full mt-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-md font-medium"
        >
          {isSignIn
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        {/* Bottom Text */}
        {!isSignIn && (
          <p className="text-sm text-gray-500 mt-5">
            By signing up, you agree with our{" "}
            <a href="#" className="underline hover:text-gray-600">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
