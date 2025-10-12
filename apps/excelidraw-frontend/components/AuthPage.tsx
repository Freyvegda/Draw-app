"use client";

import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignIn ? "signin" : "signup";
      const body = isSignIn
        ? { email, password }
        : { email, password, name };

      const res = await fetch(`${HTTP_BACKEND}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to authenticate");
      }

      if (isSignIn) {
        // ✅ Save JWT token
        localStorage.setItem("token", data.msg);
      } else {
        // After signup, immediately sign in the user to get the token
        const signinRes = await fetch(`${HTTP_BACKEND}/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const signinData = await signinRes.json();
        localStorage.setItem("token", signinData.msg);
      }

      // ✅ Redirect to room page
      router.push("/room");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-100 relative">
      <div className="w-full max-w-md px-6 py-8 bg-[#ffd9b3] shadow-lg rounded-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {!isSignIn && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border font-semibold border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border font-semibold border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading
              ? isSignIn
                ? "Signing in..."
                : "Signing up..."
              : isSignIn
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-md">{error}</p>}

        <div className="mt-6 font-bold text-md text-gray-600">
          {isSignIn ? (
            <p>
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="text-orange-600 hover:underline cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => router.push("/signin")}
                className="text-orange-600 hover:underline cursor-pointer"
              >
                Sign In
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
