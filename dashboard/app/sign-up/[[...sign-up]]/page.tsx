import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white">
			<nav className="px-6 py-5 border-b border-white/10">
				<Link href="/" className="text-base tracking-[0.3em] font-medium">
					VORTIX
				</Link>
			</nav>
			<main className="min-h-[calc(100vh-69px)] flex items-center justify-center px-4 py-12">
				<Suspense fallback={null}>
					<SignUp
						path="/sign-up"
						routing="path"
						signInUrl="/auth"
						fallbackRedirectUrl="/dashboard"
						appearance={{ elements: { rootBox: "w-full", card: "bg-transparent shadow-none" } }}
					/>
				</Suspense>
			</main>
		</div>
	);
}
