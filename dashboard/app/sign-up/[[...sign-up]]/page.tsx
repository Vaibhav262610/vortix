import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white">
			<nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/[0.06]">
				<div className="max-w-[1600px] mx-auto px-6 py-5">
					<Link href="/" className="text-base tracking-[0.3em] font-medium">
						VORTIX
					</Link>
				</div>
			</nav>
			<main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
				<div className="w-full max-w-md">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-light mb-4 tracking-tight">Create Account</h1>
						<p className="text-white/60">Sign up to access your dashboard</p>
					</div>
					<Suspense fallback={null}>
						<SignUp
						path="/sign-up"
						routing="path"
						signInUrl="/auth"
						fallbackRedirectUrl="/dashboard"
						appearance={{ elements: { rootBox: "w-full", card: "border border-slate-200 shadow-2xl" } }}
						/>
					</Suspense>
				</div>
			</main>
		</div>
	);
}
