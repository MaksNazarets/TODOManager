"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import API from "../utils/api";
import Link from "next/link";
import { useAuth } from "../utils/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>("");

  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Unexpected error occured");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-5 w-[400px] p-3 md:p-0">
      <h1 className="text-center text-3xl">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="custom-input"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="custom-input"
          required
        />
        {error && (
          <span className="text-red-400 text-xl text-center">{error}</span>
        )}
        <button
          type="submit"
          className="mt-3 text-[1.4rem] bg-gray-700 p-2 rounded-md hover:bg-gray-600 active:bg-gray-700 transition"
        >
          Login
        </button>
        <Link
          href="/signin"
          className="mt-3 text-center text-xl hover:underline hover:text-gray-300"
        >
          Sign In
        </Link>
      </form>
    </div>
  );
}
