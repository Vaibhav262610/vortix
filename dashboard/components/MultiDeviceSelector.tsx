"use client";

import { useState } from "react";

interface Device {
	deviceName: string;
	status: string;
	authenticated: boolean;
}

interface MultiDeviceSelectorProps {
	devices: Device[];
	onExecute: (deviceNames: string[], command: string) => void;
	onClose: () => void;
}

export function MultiDeviceSelector({
	devices,
	onExecute,
	onClose,
}: MultiDeviceSelectorProps) {
	const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
	const [command, setCommand] = useState("");

	const availableDevices = devices.filter(
		(d) => d.status === "online" && d.authenticated,
	);

	const toggleDevice = (deviceName: string) => {
		setSelectedDevices((prev) =>
			prev.includes(deviceName)
				? prev.filter((d) => d !== deviceName)
				: [...prev, deviceName],
		);
	};

	const selectAll = () => {
		setSelectedDevices(availableDevices.map((d) => d.deviceName));
	};

	const deselectAll = () => {
		setSelectedDevices([]);
	};

	const handleExecute = () => {
		if (selectedDevices.length === 0 || !command.trim()) return;
		onExecute(selectedDevices, command);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="glass rounded-2xl border border-white/10 w-full max-w-2xl shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
							<svg
								className="w-5 h-5 text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white">
								Multi-Device Execution
							</h3>
							<p className="text-xs text-white/50">
								Execute command on multiple devices
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition text-white/60 hover:text-white">
						<svg
							className="w-5 h-5"
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

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Device Selection */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-medium text-white/80">
								Select Devices ({selectedDevices.length}/
								{availableDevices.length})
							</label>
							<div className="flex gap-2">
								<button
									onClick={selectAll}
									className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition">
									Select All
								</button>
								<button
									onClick={deselectAll}
									className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition">
									Deselect All
								</button>
							</div>
						</div>

						{availableDevices.length === 0 ? (
							<div className="text-center py-8 px-4 rounded-xl bg-white/5 border border-white/10">
								<svg
									className="w-12 h-12 mx-auto mb-3 text-white/20"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<p className="text-sm text-white/60">No devices available</p>
								<p className="text-xs text-white/40 mt-1">
									Connect and authenticate devices first
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{availableDevices.map((device) => (
									<label
										key={device.deviceName}
										className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
											selectedDevices.includes(device.deviceName)
												? "bg-emerald-500/20 border-emerald-500/50"
												: "bg-white/5 border-white/10 hover:bg-white/10"
										}`}>
										<input
											type="checkbox"
											checked={selectedDevices.includes(device.deviceName)}
											onChange={() => toggleDevice(device.deviceName)}
											className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/50"
										/>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-emerald-400" />
												<span className="text-sm font-medium text-white/90">
													{device.deviceName}
												</span>
											</div>
										</div>
									</label>
								))}
							</div>
						)}
					</div>

					{/* Command Input */}
					<div>
						<label className="text-sm font-medium text-white/80 mb-3 block">
							Command to Execute
						</label>
						<textarea
							value={command}
							onChange={(e) => setCommand(e.target.value)}
							placeholder="Enter command or natural language (e.g., 'show me all files on desktop')"
							className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
							rows={3}
						/>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10 transition">
							Cancel
						</button>
						<button
							onClick={handleExecute}
							disabled={selectedDevices.length === 0 || !command.trim()}
							className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
								selectedDevices.length > 0 && command.trim()
									? "bg-emerald-600 hover:bg-emerald-700 text-white"
									: "bg-white/5 text-white/40 cursor-not-allowed"
							}`}>
							Execute on {selectedDevices.length} Device
							{selectedDevices.length !== 1 ? "s" : ""}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
