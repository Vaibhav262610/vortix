"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
	const [apiKey, setApiKey] = useState("");
	const [saved, setSaved] = useState(false);
	const [showKey, setShowKey] = useState(false);

	useEffect(() => {
		// Load saved API key from localStorage
		const savedKey = localStorage.getItem("groq_api_key");
		if (savedKey) {
			setApiKey(savedKey);
		}
	}, []);

	const handleSave = () => {
		if (apiKey.trim()) {
			localStorage.setItem("groq_api_key", apiKey.trim());
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		}
	};

	const handleClear = () => {
		localStorage.removeItem("groq_api_key");
		setApiKey("");
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
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
					<Link
						href="/"
						className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition">
						Back to Dashboard
					</Link>
				</div>
			</div>

			{/* Background */}
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

			<div className="container mx-auto px-4 py-12 max-w-3xl">
				{/* Hero */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
					<p className="text-white/60">
						Configure your Vortix dashboard preferences
					</p>
				</div>

				{/* API Key Section */}
				<div className="glass rounded-2xl border border-white/10 p-8 mb-6">
					<div className="flex items-start gap-4 mb-6">
						<div className="flex-1">
							<h3 className="text-xl font-bold text-white mb-2">
								Groq API Key
							</h3>
							<p className="text-white/60 text-sm">
								Add your personal Groq API key for AI-powered command planning.
								This key is stored locally in your browser and never sent to our
								servers.
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-white/70 mb-2">
								API Key
							</label>
							<div className="relative">
								<input
									type={showKey ? "text" : "password"}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder="gsk_..."
									className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition font-mono text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowKey(!showKey)}
									className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-white/60 hover:text-white transition">
									{showKey ? "Hide" : "Show"}
								</button>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleSave}
								disabled={!apiKey.trim()}
								className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
									apiKey.trim()
										? "bg-emerald-600 hover:bg-emerald-700 text-white"
										: "bg-white/5 text-white/40 cursor-not-allowed"
								}`}>
								{saved ? "Saved!" : "Save API Key"}
							</button>
							<button
								onClick={handleClear}
								className="px-6 py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 font-medium transition">
								Clear
							</button>
						</div>

						<div className="mt-4 p-4 rounded-lg bg-blue-600/10 border border-blue-600/30">
							<p className="text-sm text-blue-300 mb-2">
								<span className="font-semibold">How to get your API key:</span>
							</p>
							<ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
								<li>
									Visit{" "}
									<a
										href="https://console.groq.com/keys"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 hover:underline font-medium">
										console.groq.com/keys
									</a>
								</li>
								<li>Sign up or log in (it's free!)</li>
								<li>Create a new API key</li>
								<li>Copy and paste it here</li>
							</ol>
						</div>
					</div>
				</div>

				{/* About Section */}
				<div className="glass rounded-2xl border border-white/10 p-8">
					<div className="flex items-start gap-4 mb-6">
						<div className="flex-1">
							<h3 className="text-xl font-bold text-white mb-2">
								About Vortix
							</h3>
							<p className="text-white/60 text-sm mb-4">
								Vortix is an open-source remote OS control system with
								AI-powered command planning. Control your devices from anywhere
								with natural language commands.
							</p>
							<div className="flex flex-wrap gap-3">
								<a
									href="https://github.com/Vaibhav262610/vortix"
									target="_blank"
									rel="noopener noreferrer"
									className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm transition">
									GitHub
								</a>
								<a
									href="/contact"
									className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition">
									Contact Developer
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Privacy Notice */}
				<div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
					<p className="text-xs text-white/50 text-center">
						Your API key is stored locally in your browser and is never sent to
						Vortix servers. It's only used for direct communication with Groq
						API.
					</p>
				</div>
			</div>
		</div>
	);
}
