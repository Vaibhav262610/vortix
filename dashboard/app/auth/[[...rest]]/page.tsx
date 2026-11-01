"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";

export default function AuthPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  useEffect(() => { if (isLoaded && isSignedIn) router.replace("/dashboard"); }, [isLoaded, isSignedIn, router]);

  return <div className="site-grid min-h-screen bg-[#080d0d] text-[#e8f0ed]"><header className="border-b border-white/10"><div className="mx-auto max-w-6xl px-5 py-5 sm:px-8"><Link href="/" className="text-sm font-extrabold tracking-[0.25em]">VORTIX</Link></div></header><main className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24"><div><p className="site-section-label">WELCOME BACK</p><h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Your devices are one sign-in away.</h1><p className="mt-6 max-w-lg text-base leading-8 text-[#a6b9ab]">Sign in to reach your workspace, review plans, and work with your connected devices.</p><div className="mt-10 max-w-md border-t border-white/10 pt-7 text-sm text-[#88a091]">New to Vortix? <Link href="/sign-up" className="font-semibold text-emerald-300 hover:text-emerald-200">Create an account →</Link></div></div><div className="flex justify-center lg:justify-end">{!isLoaded ? <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-label="Loading sign in" /> : <Suspense fallback={null}><SignIn path="/auth" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" appearance={{ elements: { rootBox: "w-full", card: "border border-slate-200 shadow-2xl" } }} /></Suspense>}</div></main></div>;
}
