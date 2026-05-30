"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Command {
	id: string;
	command: string;
	output: string;
	exitCode: number;
	status: string;
	executedAt: string;
	duration: number;
	device: {
		deviceName: string;
		platform: string;
	};
}

interface CommandHistoryProps {
	deviceId?: string;
}

export default function CommandHistory({ deviceId }: CommandHistoryProps) {
	const [commands, setCommands] = useState<Command[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);

	useEffect(() => {
		fetchHistory();
	}, [deviceId, search]);

	const fetchHistory = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				...(deviceId && { deviceId }),
				...(search && { search }),
				limit: "50",
			});

			const response = await fetch(`/api/history?${params}`);
			const data = await response.json();

			if (data.commands) {
				setCommands(data.commands);
			}
		} catch (error) {
			console.error("Error fetching history:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return `${seconds}s ago`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success":
				return "text-emerald-400";
			case "error":
				return "text-red-400";
			default:
				return "text-yellow-400";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return "✓";
			case "error":
				return "✗";
			default:
				return "⏳";
		}
	};

	return (
		<div className="space-y-4">
			{/* Search */}
			<div className="relative">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search commands..."
					className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition"
				/>
				<svg
					className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>

			{/* Command List */}
			<div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
				{loading ? (
					<div className="text-center py-12 text-white/40">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
						<p className="mt-4">Loading history...</p>
					</div>
				) : commands.length === 0 ? (
					<div className="text-center py-12 text-white/40">
						<svg
							className="w-16 h-16 mx-auto mb-4 opacity-20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<p>No commands found</p>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm">
								Clear search
							</button>
						)}
					</div>
				) : (
					commands.map((cmd) => (
						<motion.div
							key={cmd.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer"
							onClick={() => setSelectedCommand(cmd)}>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<span className={`text-lg ${getStatusColor(cmd.status)}`}>
											{getStatusIcon(cmd.status)}
										</span>
										<code className="text-sm text-white/90 font-mono truncate">
											{cmd.command}
										</code>
									</div>
									<div className="flex items-center gap-4 text-xs text-white/40">
										<span>{cmd.device.deviceName}</span>
										<span>•</span>
										<span>{formatDate(cmd.executedAt)}</span>
										{cmd.duration && (
											<>
												<span>•</span>
												<span>{cmd.duration}ms</span>
											</>
										)}
									</div>
								</div>
								<svg
									className="w-5 h-5 text-white/40 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</motion.div>
					))
				)}
			</div>

			{/* Command Detail Modal */}
			<AnimatePresence>
				{selectedCommand && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						onClick={() => setSelectedCommand(null)}>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}>
							{/* Header */}
							<div className="flex items-start justify-between mb-6">
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Command Details
									</h3>
									<div className="flex items-center gap-2 text-sm text-white/60">
										<span>{selectedCommand.device.deviceName}</span>
										<span>•</span>
										<span>{formatDate(selectedCommand.executedAt)}</span>
									</div>
								</div>
								<button
									onClick={() => setSelectedCommand(null)}
									className="text-white/60 hover:text-white transition">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Command */}
							<div className="mb-4">
								<label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
									Command
								</label>
								<div className="bg-black/40 border border-white/10 rounded-lg p-4">
									<code className="text-sm text-white font-mono">
										{selectedCommand.command}
									</code>
								</div>
							</div>

							{/* Status */}
							<div className="grid grid-cols-3 gap-4 mb-4">
								<div>
									<label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
										Status
									</label>
									<div
										className={`text-sm font-semibold ${getStatusColor(
											selectedCommand.status,
										)}`}>
										{selectedCommand.status.toUpperCase()}
									</div>
								</div>
								<div>
									<label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
										Exit Code
									</label>
									<div className="text-sm text-white/90">
										{selectedCommand.exitCode ?? "N/A"}
									</div>
								</div>
								<div>
									<label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
										Duration
									</label>
									<div className="text-sm text-white/90">
										{selectedCommand.duration
											? `${selectedCommand.duration}ms`
											: "N/A"}
									</div>
								</div>
							</div>

							{/* Output */}
							{selectedCommand.output && (
								<div>
									<label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
										Output
									</label>
									<div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
										<pre className="text-sm text-white/90 font-mono whitespace-pre-wrap">
											{selectedCommand.output}
										</pre>
									</div>
								</div>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<style jsx global>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 8px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(255, 255, 255, 0.05);
					border-radius: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.2);
					border-radius: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(255, 255, 255, 0.3);
				}
			`}</style>
		</div>
	);
}
