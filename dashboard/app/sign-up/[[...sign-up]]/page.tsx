import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Link from "next/link";

export default function SignUpPage() {
  return <div className="site-grid min-h-screen bg-[#080d0d] text-[#e8f0ed]"><header className="border-b border-white/10"><div className="mx-auto max-w-6xl px-5 py-5 sm:px-8"><Link href="/" className="text-sm font-extrabold tracking-[0.25em]">VORTIX</Link></div></header><main className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24"><div><p className="site-section-label">CREATE YOUR WORKSPACE</p><h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Your devices, under your account.</h1><p className="mt-6 max-w-lg text-base leading-8 text-[#a6b9ab]">Create an account, connect your first device, and start with a simple task.</p><div className="mt-10 max-w-md border-t border-white/10 pt-7 text-sm text-[#88a091]">Already have an account? <Link href="/auth" className="font-semibold text-emerald-300 hover:text-emerald-200">Sign in →</Link></div></div><div className="flex justify-center lg:justify-end"><Suspense fallback={null}><SignUp path="/sign-up" routing="path" signInUrl="/auth" fallbackRedirectUrl="/dashboard" appearance={{ elements: { rootBox: "w-full", card: "border border-slate-200 shadow-2xl" } }} /></Suspense></div></main></div>;
}
