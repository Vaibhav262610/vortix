"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const { isSignedIn, isLoaded } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (isLoaded && isSignedIn) {
			router.push("/dashboard");
		}
	}, [isSignedIn, isLoaded, router]);

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white">
			{/* Background effects */}
			<div
				className="fixed inset-0 -z-10"
				style={{
					background:
						"radial-gradient(ellipse 100% 80% at 50% -20%, rgba(45, 55, 72, 0.4), transparent 50%), linear-gradient(180deg, #0d0d0f 0%, #12121a 100%)",
				}}
			/>
			<div
				className="fixed inset-0 -z-10 opacity-[0.02]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/[0.06]">
				<div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
					<Link href="/" className="text-base tracking-[0.3em] font-medium">
						VORTIX
					</Link>
				</div>
			</nav>

			{/* Main content */}
			<div className="flex items-center justify-center min-h-screen px-4 pt-20">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-light mb-4 tracking-tight">
							{isSignUp ? "Create Account" : "Welcome Back"}
						</h1>
						<p className="text-white/60">
							{isSignUp
								? "Sign up to start controlling your devices"
								: "Sign in to access your dashboard"}
						</p>
					</div>

					{/* Clerk Auth Component */}
					<div className="flex justify-center">
						{isSignUp ? (
							<SignUp
								appearance={{
									elements: {
										rootBox: "w-full",
										card: "bg-transparent shadow-none",
									},
								}}
							/>
						) : (
							<SignIn
								appearance={{
									elements: {
										rootBox: "w-full",
										card: "bg-transparent shadow-none",
									},
								}}
							/>
						)}
					</div>

					{/* Toggle between sign in and sign up */}
					<div className="mt-6 text-center">
						<button
							onClick={() => setIsSignUp(!isSignUp)}
							className="text-sm text-white/60 hover:text-white transition">
							{isSignUp
								? "Already have an account? Sign in"
								: "Don't have an account? Sign up"}
						</button>
					</div>

					{/* Features */}
					<div className="mt-12 space-y-4">
						<div className="flex items-center gap-3 text-sm text-white/60">
							<svg
								className="w-5 h-5 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>AI-powered command generation</span>
						</div>
						<div className="flex items-center gap-3 text-sm text-white/60">
							<svg
								className="w-5 h-5 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Multi-device management</span>
						</div>
						<div className="flex items-center gap-3 text-sm text-white/60">
							<svg
								className="w-5 h-5 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Real-time monitoring & control</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
