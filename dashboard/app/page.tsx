"use client";

import { useEffect, useState, useRef } from "react";

type Device = {
	deviceName: string;
	status: string;
	authenticated: boolean;
};

type ApprovalDialog = {
	isOpen: boolean;
	command: string;
	deviceName: string;
} | null;

type AuthDialog = {
	isOpen: boolean;
	deviceName: string;
} | null;

export default function Home() {
	const [isPlanning, setIsPlanning] = useState(false);
	const [isExecuting, setIsExecuting] = useState(false);
	const [planPreview, setPlanPreview] = useState<any[]>([]);
	const [approvalDialog, setApprovalDialog] = useState<ApprovalDialog>(null);
	const [authDialog, setAuthDialog] = useState<AuthDialog>(null);
	const [authPassword, setAuthPassword] = useState("");

	const [devices, setDevices] = useState<Device[]>([]);
	const [logs, setLogs] = useState<string[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<string>("");
	const [command, setCommand] = useState("");

	const wsRef = useRef<WebSocket | null>(null);
	const logsRef = useRef<HTMLDivElement | null>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	useEffect(() => {
		console.log("Connecting to backend WebSocket...");

		// Use environment variable or fallback to Render URL
		const backendWS =
			process.env.NEXT_PUBLIC_BACKEND_WS || "wss://vortix.onrender.com";
		console.log("Backend URL:", backendWS);

		const ws = new WebSocket(`${backendWS}?type=dashboard`);
		// console.log(isExecuting)

		wsRef.current = ws;

		ws.onopen = () => {
			console.log("Dashboard connected to backend");
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("Message received:", data.type, data);

			if (data.type === "DEVICES") {
				console.log("Devices received:", data.devices);
				data.devices.forEach((device: Device) => {
					console.log(
						`Device: ${device.deviceName}, authenticated: ${device.authenticated}, status: ${device.status}`,
					);
				});
				setDevices(data.devices);
			}

			if (data.type === "AUTH_SUCCESS") {
				console.log("Device authenticated:", data.deviceName);
				setAuthDialog(null);
				setAuthPassword("");
				setSelectedDevice(data.deviceName);
			}

			if (data.type === "AUTH_ERROR") {
				console.error("Auth error:", data.error);
				alert(`Authentication failed: ${data.error}`);
			}

			if (data.type === "EXECUTION_STARTED") {
				console.log("Execution started");
				setIsExecuting(true);
			}

			if (data.type === "PLAN_PREVIEW") {
				console.log("Plan preview received:", data.steps);
				setIsPlanning(false);
				setPlanPreview(data.steps);
			}

			if (data.type === "PLAN_ERROR") {
				console.error("Plan error:", data.error);
				setIsPlanning(false);
				setLogs((prev) => [...prev, `[ERROR] ${data.error}`]);
				alert(
					`AI Planning Error: ${data.error}\n\nPlease enter commands directly instead.`,
				);
			}

			if (data.type === "APPROVAL_REQUIRED") {
				setApprovalDialog({
					isOpen: true,
					command: data.command,
					deviceName: data.deviceName,
				});
			}

			if (data.type === "EXECUTION_FINISHED") {
				setIsExecuting(false);
				console.log("Execution finished");
			}

			if (data.type === "LOG") {
				setLogs((prev) => [...prev, `[${data.deviceName}] ${data.message}`]);
			}
			// console.log("finish time:",isExecuting)
		};

		ws.onerror = (err) => {
			console.error("WebSocket error:", err);
		};

		ws.onclose = () => {
			console.log("Dashboard WebSocket disconnected");
		};

		return () => ws.close();
	}, []);

	// Auto-scroll when logs update (unless user scrolled up)
	useEffect(() => {
		const el = logsRef.current;
		if (!el) return;
		if (autoScroll) {
			el.scrollTop = el.scrollHeight;
		}
	}, [logs, autoScroll]);

	const sendCommand = () => {
		if (!selectedDevice || !command) return;

		setIsPlanning(true);
		setIsExecuting(true);

		// Get user's API key from localStorage
		const userApiKey = localStorage.getItem("groq_api_key");

		wsRef.current?.send(
			JSON.stringify({
				type: "PLAN",
				deviceName: selectedDevice,
				command,
				apiKey: userApiKey || undefined, // Send user's API key if available
			}),
		);

		setCommand("");
	};

	const handleApprove = () => {
		if (approvalDialog) {
			wsRef.current?.send(
				JSON.stringify({
					type: "FORCE_EXECUTE",
					deviceName: approvalDialog.deviceName,
					command: approvalDialog.command,
				}),
			);
			setApprovalDialog(null);
		}
	};

	const handleRejectApproval = () => {
		setApprovalDialog(null);
	};

	const handleDeviceClick = (device: Device) => {
		console.log(
			"Device clicked:",
			device.deviceName,
			"authenticated:",
			device.authenticated,
		);

		if (!device.authenticated) {
			// Show password dialog
			console.log("Opening auth dialog for:", device.deviceName);
			setAuthDialog({
				isOpen: true,
				deviceName: device.deviceName,
			});
		} else {
			console.log(
				"Device already authenticated, selecting:",
				device.deviceName,
			);
			setSelectedDevice(device.deviceName);
		}
	};

	const handleAuthSubmit = () => {
		if (!authDialog || !authPassword) return;

		wsRef.current?.send(
			JSON.stringify({
				type: "AUTH_DEVICE",
				deviceName: authDialog.deviceName,
				password: authPassword,
			}),
		);
	};

	return (
		<div className="min-h-screen bg-[#0d0d0f] text-white">
			{/* Header */}
			<div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-30">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div>
							<h1 className="text-2xl font-bold text-white">Vortix</h1>
							<p className="text-xs text-white/50">Remote OS Control</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<a
							href="/setup"
							className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition">
							Setup Guide
						</a>
						<a
							href="/settings"
							className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition">
							Settings
						</a>
						<a
							href="/contact"
							className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition">
							Contact
						</a>
					</div>
				</div>
			</div>

			{/* Auth Dialog */}
			{authDialog?.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
						<h3 className="text-lg font-semibold text-white mb-4">
							Enter Device Password
						</h3>
						<p className="text-sm text-white/60 mb-4">
							Device:{" "}
							<span className="font-mono text-emerald-400">
								{authDialog.deviceName}
							</span>
						</p>
						<input
							type="password"
							value={authPassword}
							onChange={(e) => setAuthPassword(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAuthSubmit()}
							placeholder="Enter password..."
							className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
							autoFocus
						/>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setAuthDialog(null);
									setAuthPassword("");
								}}
								className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10 transition">
								Cancel
							</button>
							<button
								onClick={handleAuthSubmit}
								disabled={!authPassword}
								className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
									authPassword
										? "bg-emerald-600 hover:bg-emerald-700 text-white"
										: "bg-white/5 text-white/40 cursor-not-allowed"
								}`}>
								Unlock
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Approval Toast - Top Right */}
			{approvalDialog?.isOpen && (
				<div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2 duration-300">
					<div className="glass rounded-2xl border border-red-500/30 p-4 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-500/5">
						<div className="flex items-start gap-3 mb-3">
							<div className="h-8 w-8 rounded-lg bg-red-500/30 flex-shrink-0 flex items-center justify-center">
								<svg
									className="w-5 h-5 text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a2 2 0 00-2 2v2m4 6a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 100-4 2 2 0 000 4z"
									/>
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-semibold text-red-200">
									Dangerous Command
								</h3>
								<p className="text-xs text-red-400/80 mt-0.5">
									{approvalDialog.deviceName}
								</p>
							</div>
						</div>
						<div className="mb-3 p-2.5 rounded-lg bg-black/30 border border-red-500/20">
							<p className="font-mono text-xs text-red-300/90 break-all">
								{approvalDialog.command}
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={handleRejectApproval}
								className="flex-1 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-xs font-medium hover:bg-red-500/10 transition">
								Decline
							</button>
							<button
								onClick={handleApprove}
								className="flex-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-lg shadow-red-600/20">
								Approve
							</button>
						</div>
					</div>
				</div>
			)}

			{planPreview.length > 0 && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 max-w-2xl w-full mx-4 shadow-2xl">
						{/* Header */}
						<div className="mb-6">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
									<svg
										className="w-6 h-6 text-emerald-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">
										AI Generated Plan
									</h3>
									<p className="text-xs text-emerald-400/80 mt-1">
										{planPreview.length} steps
									</p>
								</div>
							</div>
						</div>

						{/* Plan Steps */}
						<div className="mb-6 space-y-2">
							{planPreview.map((step, index) => (
								<div
									key={index}
									className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.08] transition">
									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
												{index + 1}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-mono text-sm text-white/80 break-all">
												{step.command}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							<button
								onClick={() => setPlanPreview([])}
								className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/20">
								Cancel
							</button>
							<button
								onClick={() => {
									wsRef.current?.send(
										JSON.stringify({
											type: "APPROVE_PLAN",
											deviceName: selectedDevice,
											steps: planPreview,
										}),
									);
									setPlanPreview([]);
								}}
								className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
								Approve & Execute
							</button>
						</div>
					</div>
				</div>
			)}

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

			<div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
				{/* Header */}
				<header className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-6">
					<div>
						<h1 className="text-xl font-semibold tracking-tight text-white/95 sm:text-2xl">
							Vortix Dashboard
						</h1>
						<p className="text-sm text-white/50 mt-1">
							Manage and control your connected devices
						</p>
					</div>
					<div className="flex items-center gap-2">
						{devices.filter((d) => d.status === "online").length > 0 && (
							<div className="px-3 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-600/30">
								<span className="text-xs text-emerald-400 font-medium">
									{devices.filter((d) => d.status === "online").length} Online
								</span>
							</div>
						)}
						{devices.filter((d) => d.status === "offline").length > 0 && (
							<div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
								<span className="text-xs text-white/50 font-medium">
									{devices.filter((d) => d.status === "offline").length} Offline
								</span>
							</div>
						)}
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
					{/* Devices — glass panel */}
					<div className="glass rounded-2xl p-5 sm:p-6 h-fit">
						{devices.length === 0 ? (
							<>
								<div className="flex items-center justify-between mb-4">
									<p className="text-xs font-medium uppercase tracking-widest text-white/45">
										Your Devices
									</p>
								</div>
								<div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
									<p className="text-sm text-white/70 mb-4">
										No devices connected yet
									</p>
									<p className="text-xs text-white/50 mb-4">
										Install Vortix CLI and start an agent to see your devices
										here
									</p>
									<a
										href="/setup"
										className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition">
										View Setup Guide
									</a>
								</div>
							</>
						) : (
							<>
								{/* Online Devices */}
								{devices.filter((d) => d.status === "online").length > 0 && (
									<div className="mb-6">
										<div className="flex items-center justify-between mb-3">
											<p className="text-xs font-medium uppercase tracking-widest text-white/45">
												Online Devices
											</p>
											<div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
										</div>
										<ul className="space-y-2">
											{devices
												.filter((d) => d.status === "online")
												.map((device, index) => (
													<li key={index}>
														<button
															type="button"
															onClick={() => handleDeviceClick(device)}
															className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
																selectedDevice === device.deviceName &&
																device.authenticated
																	? "glass-strong text-white shadow-lg shadow-emerald-600/10 border border-emerald-600/30"
																	: "text-white/80 hover:bg-white/[0.06] border border-transparent"
															}`}>
															{device.authenticated ? (
																<span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
															) : (
																<svg
																	className="w-4 h-4 text-orange-400"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
																	/>
																</svg>
															)}
															<span className="min-w-0 truncate font-medium">
																{device.deviceName}
															</span>
															<span
																className={`ml-auto shrink-0 text-[11px] uppercase tracking-wider ${
																	device.authenticated
																		? "text-emerald-400/90"
																		: "text-orange-400/90"
																}`}>
																{device.authenticated ? "online" : "locked"}
															</span>
														</button>
													</li>
												))}
										</ul>
									</div>
								)}

								{/* Recent Devices (Offline) */}
								{devices.filter((d) => d.status === "offline").length > 0 && (
									<div>
										<div className="flex items-center justify-between mb-3">
											<p className="text-xs font-medium uppercase tracking-widest text-white/45">
												Recent Devices
											</p>
											<span className="text-[10px] text-white/30">
												{devices.filter((d) => d.status === "offline").length}{" "}
												offline
											</span>
										</div>
										<ul className="space-y-2">
											{devices
												.filter((d) => d.status === "offline")
												.map((device, index) => (
													<li key={index}>
														<button
															type="button"
															onClick={() => handleDeviceClick(device)}
															className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all text-white/50 hover:bg-white/[0.04] border border-transparent opacity-60">
															<span className="h-2 w-2 shrink-0 rounded-full bg-white/20" />
															<span className="min-w-0 truncate font-medium">
																{device.deviceName}
															</span>
															<span className="ml-auto shrink-0 text-[11px] uppercase tracking-wider text-white/30">
																offline
															</span>
														</button>
													</li>
												))}
										</ul>
									</div>
								)}
							</>
						)}
					</div>

					{/* Main: command + logs */}
					<div className="flex flex-col gap-6">
						{/* Command — glass bar */}
						<div className="glass rounded-2xl p-5 sm:p-6">
							<div className="flex items-center justify-between mb-3">
								<p className="text-xs font-medium uppercase tracking-widest text-white/45">
									Send Command
								</p>
								{selectedDevice && (
									<div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600/10 border border-emerald-600/30">
										<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-xs text-emerald-400 font-medium">
											{selectedDevice}
										</span>
									</div>
								)}
							</div>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<input
									value={command}
									onChange={(e) => setCommand(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && sendCommand()}
									placeholder="Type a command or describe what you want to do..."
									className="glass-input flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-white/10"
								/>
								<button
									type="button"
									onClick={sendCommand}
									disabled={isExecuting || isPlanning || !selectedDevice}
									className={`rounded-xl px-6 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 sm:shrink-0 ${
										isExecuting || isPlanning
											? "cursor-not-allowed bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
											: "bg-emerald-600 hover:bg-emerald-700 text-white"
									}`}>
									{isExecuting
										? "Executing..."
										: isPlanning
											? "Planning..."
											: "Send Command"}
								</button>
							</div>
							{!selectedDevice && (
								<p className="mt-3 text-xs text-orange-400/70">
									Please select a device first
								</p>
							)}
						</div>

						{/* Logs — glass window */}
						<div className="glass rounded-2xl overflow-hidden flex flex-col">
							<div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
								<div className="flex gap-1.5">
									<span className="h-2 w-2 rounded-full bg-white/20" />
									<span className="h-2 w-2 rounded-full bg-white/20" />
									<span className="h-2 w-2 rounded-full bg-white/20" />
								</div>
								<span className="text-xs font-medium text-white/50">Logs</span>
								<div className="ml-auto flex items-center gap-2">
									<button
										onClick={() => setAutoScroll((s) => !s)}
										className={`text-xs px-2 py-1 rounded-md border ${
											autoScroll
												? "bg-white/5 border-white/10 text-white"
												: "bg-transparent border-white/10 text-white/60"
										}`}>
										{autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
									</button>
								</div>
							</div>
							<div
								ref={logsRef}
								onScroll={() => {
									const el = logsRef.current;
									if (!el) return;
									const atBottom =
										el.scrollHeight - el.scrollTop - el.clientHeight < 40;
									if (atBottom !== autoScroll) setAutoScroll(atBottom);
								}}
								className="h-80 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed text-white/75">
								{logs.length === 0 ? (
									<p className="text-white/35">No entries yet.</p>
								) : (
									logs.map((log, index) => (
										<div
											key={index}
											className="border-l-2 border-transparent py-0.5 pl-3 hover:border-white/20 hover:bg-white/[0.03]">
											{log}
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
