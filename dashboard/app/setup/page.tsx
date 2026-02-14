"use client";

import { useState } from "react";
import Link from "next/link";

export default function SetupPage() {
	const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedCommand(id);
		setTimeout(() => setCopiedCommand(null), 2000);
	};

	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white">
			{/* Header */}
			<div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-white">Vortix</h1>
						<p className="text-xs text-white/50">Remote OS Control</p>
					</div>
					<div className="flex items-center gap-3">
						<Link
							href="/"
							className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition">
							Back to Dashboard
						</Link>
						<a
							href="/contact"
							className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition">
							Contact
						</a>
					</div>
				</div>
			</div>

			{/* Background: soft gradient + grain */}
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

			<div className="container mx-auto px-4 py-12 max-w-4xl">
				{/* Hero */}
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-white mb-3">
						Welcome to Vortix
					</h2>
					<p className="text-lg text-white/60">
						AI-Powered Remote OS Control System
					</p>
				</div>

				{/* Installation Steps */}
				<div className="glass rounded-2xl border border-white/10 p-8 mb-8">
					<h3 className="text-2xl font-bold text-white mb-6">Quick Setup</h3>

					{/* Step 1 */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
								1
							</div>
							<h4 className="text-lg font-semibold text-white">
								Install Vortix CLI
							</h4>
						</div>
						<div className="ml-11">
							<div className="bg-black/40 rounded-lg p-4 mb-3 flex items-center justify-between">
								<code className="text-emerald-400 font-mono text-sm">
									npm install -g vortix
								</code>
								<button
									onClick={() =>
										copyToClipboard("npm install -g vortix", "install")
									}
									className="ml-4 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition border border-white/10">
									{copiedCommand === "install" ? "✓ Copied" : "Copy"}
								</button>
							</div>
							<p className="text-white/50 text-sm">
								Install the Vortix CLI globally on your computer
							</p>
						</div>
					</div>

					{/* Step 2 */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
								2
							</div>
							<h4 className="text-lg font-semibold text-white">
								Start the Agent
							</h4>
						</div>
						<div className="ml-11">
							<div className="bg-black/40 rounded-lg p-4 mb-3 flex items-center justify-between">
								<code className="text-emerald-400 font-mono text-sm">
									vortix start
								</code>
								<button
									onClick={() => copyToClipboard("vortix start", "start")}
									className="ml-4 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition border border-white/10">
									{copiedCommand === "start" ? "✓ Copied" : "Copy"}
								</button>
							</div>
							<p className="text-white/50 text-sm">
								Run this command on each device you want to control
							</p>
						</div>
					</div>

					{/* Step 3 */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
								3
							</div>
							<h4 className="text-lg font-semibold text-white">
								Control Your Devices
							</h4>
						</div>
						<div className="ml-11">
							<Link
								href="/"
								className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition text-sm">
								Open Dashboard
							</Link>
							<p className="text-white/50 text-sm mt-3">
								Your connected devices will appear in the dashboard
							</p>
						</div>
					</div>

					{/* Step 4 - Testing */}
					<div>
						<div className="flex items-center gap-3 mb-3">
							<div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
								4
							</div>
							<h4 className="text-lg font-semibold text-white">
								Test Your Setup
							</h4>
						</div>
						<div className="ml-11">
							<p className="text-white/50 text-sm mb-3">
								Try these basic commands to verify everything is working:
							</p>
							<div className="space-y-2">
								<div className="bg-black/40 rounded-lg p-3 border border-white/10">
									<code className="text-emerald-400 font-mono text-sm">
										open notepad
									</code>
									<p className="text-white/40 text-xs mt-1">
										Opens Notepad application
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Free API Notice */}
				<div className="glass rounded-2xl border border-emerald-600/30 bg-emerald-600/5 p-6 mb-8">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
							<svg
								className="w-5 h-5 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h4 className="text-lg font-semibold text-emerald-300 mb-2">
								Free AI Planning Available
							</h4>
							<p className="text-emerald-200/80 text-sm mb-3">
								No need to enter any API key right now! The server is using a
								free admin API key for AI planning. You can start using
								AI-powered commands immediately.
							</p>
							<p className="text-emerald-200/60 text-xs">
								Note: This free API will be removed later. You'll be notified
								when you need to add your own API key.
							</p>
						</div>
					</div>
				</div>

				{/* AI Planning Options */}
				<div className="glass rounded-2xl border border-white/10 p-8">
					<h3 className="text-2xl font-bold text-white mb-6">
						AI Planning Setup (Optional)
					</h3>
					<p className="text-white/50 text-sm mb-6">
						Want to use your own API key? Here are your options:
					</p>

					<div className="space-y-6">
						{/* Option 1: Groq API */}
						<div className="border border-white/10 rounded-xl p-6 bg-black/20">
							<div className="flex items-start gap-4">
								<div className="flex-1">
									<h4 className="text-lg font-semibold text-white mb-2">
										Option 1: Use Groq API (Recommended)
									</h4>
									<p className="text-white/50 text-sm mb-4">
										Free cloud-based AI planning. No local setup required.
									</p>
									<ol className="space-y-2 text-sm text-white/60 mb-4 list-decimal list-inside">
										<li>
											Get free API key from{" "}
											<a
												href="https://console.groq.com/keys"
												target="_blank"
												rel="noopener noreferrer"
												className="text-emerald-400 hover:underline">
												console.groq.com/keys
											</a>
										</li>
										<li>
											Add to Render environment variables:{" "}
											<code className="px-2 py-0.5 bg-black/40 rounded text-emerald-400 font-mono text-xs">
												GROQ_API_KEY
											</code>
										</li>
										<li>AI planning will work automatically!</li>
									</ol>
									<div className="flex gap-2">
										<span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 rounded-md text-xs font-medium border border-emerald-600/30">
											FREE
										</span>
										<span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-md text-xs font-medium border border-blue-600/30">
											30 req/min
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Option 2: Local Ollama */}
						<div className="border border-white/10 rounded-xl p-6 bg-black/20">
							<div className="flex items-start gap-4">
								<div className="flex-1">
									<h4 className="text-lg font-semibold text-white mb-2">
										Option 2: Run Ollama Locally
									</h4>
									<p className="text-white/50 text-sm mb-4">
										Run AI models on your own machine. Unlimited usage.
									</p>
									<ol className="space-y-2 text-sm text-white/60 mb-4 list-decimal list-inside">
										<li>
											Install Ollama from{" "}
											<a
												href="https://ollama.ai"
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-400 hover:underline">
												ollama.ai
											</a>
										</li>
										<li>
											Run:{" "}
											<code className="px-2 py-0.5 bg-black/40 rounded text-purple-400 font-mono text-xs">
												ollama pull qwen2.5:7b
											</code>
										</li>
										<li>
											Start backend locally:{" "}
											<code className="px-2 py-0.5 bg-black/40 rounded text-purple-400 font-mono text-xs">
												node server.js
											</code>
										</li>
									</ol>
									<div className="flex gap-2">
										<span className="px-2.5 py-1 bg-purple-600/20 text-purple-400 rounded-md text-xs font-medium border border-purple-600/30">
											FREE
										</span>
										<span className="px-2.5 py-1 bg-orange-600/20 text-orange-400 rounded-md text-xs font-medium border border-orange-600/30">
											Unlimited
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Option 3: No AI */}
						<div className="border border-white/10 rounded-xl p-6 bg-black/20">
							<div className="flex items-start gap-4">
								<div className="flex-1">
									<h4 className="text-lg font-semibold text-white mb-2">
										Option 3: Skip AI Planning
									</h4>
									<p className="text-white/50 text-sm mb-2">
										Use direct commands without AI assistance. Works perfectly!
									</p>
									<p className="text-sm text-white/60">
										Just type commands directly and click "Execute". No setup
										needed.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div className="text-center mt-12">
					<Link
						href="/"
						className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition">
						Get Started
					</Link>
					<p className="text-white/40 text-sm mt-4">Free and open source</p>
				</div>
			</div>
		</div>
	);
}
