"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Check if already logged in
		const session = localStorage.getItem("vortix_session");
		if (session) {
			router.push("/");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const backendWS =
				process.env.NEXT_PUBLIC_BACKEND_WS || "wss://vortix.onrender.com";
			const ws = new WebSocket(`${backendWS}?type=dashboard`);

			ws.onopen = () => {
				ws.send(
					JSON.stringify({
						type: isLogin ? "LOGIN" : "REGISTER",
						username,
						password,
					}),
				);
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);

				if (data.type === "LOGIN_SUCCESS" || data.type === "REGISTER_SUCCESS") {
					localStorage.setItem("vortix_session", data.sessionToken);
					localStorage.setItem("vortix_username", data.username);
					ws.close();
					router.push("/");
				} else if (
					data.type === "LOGIN_ERROR" ||
					data.type === "REGISTER_ERROR"
				) {
					setError(data.error);
					setLoading(false);
					ws.close();
				}
			};

			ws.onerror = () => {
				setError("Connection error. Please try again.");
				setLoading(false);
			};
		} catch (err) {
			setError("An error occurred. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white flex items-center justify-center">
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

			<div className="w-full max-w-md px-4">
				{/* Logo */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">Vortix</h1>
					<p className="text-white/60">Remote OS Control System</p>
				</div>

				{/* Auth Form */}
				<div className="glass rounded-2xl border border-white/10 p-8">
					<div className="flex gap-2 mb-6">
						<button
							onClick={() => setIsLogin(true)}
							className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
								isLogin
									? "bg-emerald-600 text-white"
									: "bg-white/5 text-white/60 hover:text-white"
							}`}>
							Login
						</button>
						<button
							onClick={() => setIsLogin(false)}
							className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
								!isLogin
									? "bg-emerald-600 text-white"
									: "bg-white/5 text-white/60 hover:text-white"
							}`}>
							Register
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-white/70 mb-2">
								Username
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
								placeholder="Enter your username"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-white/70 mb-2">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
								placeholder="Enter your password"
							/>
						</div>

						{error && (
							<div className="p-3 rounded-lg bg-red-600/10 border border-red-600/30 text-red-300 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className={`w-full px-6 py-3 rounded-xl font-medium transition ${
								loading
									? "bg-emerald-600/50 cursor-not-allowed"
									: "bg-emerald-600 hover:bg-emerald-700"
							} text-white`}>
							{loading
								? "Please wait..."
								: isLogin
									? "Login"
									: "Create Account"}
						</button>
					</form>

					<div className="mt-6 p-4 rounded-lg bg-blue-600/10 border border-blue-600/30">
						<p className="text-sm text-blue-300 mb-2">
							<span className="font-semibold">First time here?</span>
						</p>
						<p className="text-xs text-blue-200/80">
							Create an account to get started. Your devices will be linked to
							your account and only you can control them.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-6">
					<a
						href="/setup"
						className="text-sm text-white/50 hover:text-white transition">
						Need help? View Setup Guide
					</a>
				</div>
			</div>
		</div>
	);
}
