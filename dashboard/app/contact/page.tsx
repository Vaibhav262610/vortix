"use client";

import Link from "next/link";

export default function ContactPage() {
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
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-white mb-3">Get in Touch</h2>
					<p className="text-lg text-white/60">
						Have questions or feedback? I'd love to hear from you
					</p>
				</div>

				{/* Contact Cards */}
				<div className="space-y-6 mb-8">
					{/* Email */}
					<div className="glass rounded-2xl border border-white/10 p-8">
						<div className="flex items-start gap-4">
							<div className="flex-1">
								<h3 className="text-xl font-bold text-white mb-2">Email</h3>
								<p className="text-white/60 text-sm mb-4">
									Send me an email for any inquiries or support
								</p>
								<a
									href="mailto:vaibhavrajpoot2626@gmail.com"
									className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
									vaibhavrajpoot2626@gmail.com
								</a>
							</div>
						</div>
					</div>

					{/* Portfolio */}

					{/* GitHub */}
					<div className="glass rounded-2xl border border-white/10 p-8">
						<div className="flex items-start gap-4">
							<div className="flex-1">
								<h3 className="text-xl font-bold text-white mb-2">GitHub</h3>
								<p className="text-white/60 text-sm mb-4">
									Follow me on GitHub for more open source projects
								</p>
								<a
									href="https://github.com/Vaibhav262610"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition">
									github.com/Vaibhav262610
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Project Info */}
				<div className="glass rounded-2xl border border-white/10 p-8">
					<h3 className="text-xl font-bold text-white mb-4">About Vortix</h3>
					<p className="text-white/60 text-sm mb-4">
						Vortix is an open-source remote OS control system with AI-powered
						command planning. Built with Node.js, React, and WebSocket for
						real-time communication.
					</p>
					<div className="flex flex-wrap gap-3">
						<a
							href="https://github.com/Vaibhav262610/vortix"
							target="_blank"
							rel="noopener noreferrer"
							className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm transition">
							View Source Code
						</a>
						<a
							href="/setup"
							className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm transition">
							Setup Guide
						</a>
					</div>
				</div>

				{/* Back Button */}
				<div className="text-center mt-8">
					<Link
						href="/"
						className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition">
						Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
