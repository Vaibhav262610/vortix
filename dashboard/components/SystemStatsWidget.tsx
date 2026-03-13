"use client";

import { useEffect, useState } from "react";
import { Widget } from "./Widget";

interface SystemStats {
	cpu: number;
	memory: number;
	disk: number;
}

interface SystemStatsWidgetProps {
	deviceName: string;
	ws: WebSocket | null;
}

export function SystemStatsWidget({ deviceName, ws }: SystemStatsWidgetProps) {
	const [stats, setStats] = useState<SystemStats>({
		cpu: 0,
		memory: 0,
		disk: 0,
	});

	useEffect(() => {
		if (!ws || !deviceName) {
			console.log("SystemStatsWidget: No WebSocket or device selected");
			return;
		}

		console.log("SystemStatsWidget: Starting stats monitoring for", deviceName);

		const handleMessage = (event: MessageEvent) => {
			const data = JSON.parse(event.data);
			if (data.type === "SYSTEM_STATS" && data.deviceName === deviceName) {
				console.log(
					"SystemStatsWidget: Received stats for",
					deviceName,
					data.stats,
				);
				setStats(data.stats);
			}
		};

		ws.addEventListener("message", handleMessage);

		// Request stats immediately
		if (ws.readyState === WebSocket.OPEN) {
			console.log(
				"SystemStatsWidget: Requesting initial stats for",
				deviceName,
			);
			ws.send(
				JSON.stringify({
					type: "GET_SYSTEM_STATS",
					deviceName,
				}),
			);
		}

		// Request stats every 3 seconds
		const interval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				console.log(
					"SystemStatsWidget: Requesting stats update for",
					deviceName,
				);
				ws.send(
					JSON.stringify({
						type: "GET_SYSTEM_STATS",
						deviceName,
					}),
				);
			}
		}, 3000);

		return () => {
			console.log(
				"SystemStatsWidget: Stopping stats monitoring for",
				deviceName,
			);
			ws.removeEventListener("message", handleMessage);
			clearInterval(interval);
		};
	}, [ws, deviceName]);

	const StatBar = ({
		label,
		value,
		color,
	}: {
		label: string;
		value: number;
		color: string;
	}) => (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-xs">
				<span className="text-white/60">{label}</span>
				<span className="text-white/90 font-medium">{value}%</span>
			</div>
			<div className="h-2 bg-white/5 rounded-full overflow-hidden">
				<div
					className={`h-full ${color} transition-all duration-500`}
					style={{ width: `${value}%` }}
				/>
			</div>
		</div>
	);

	return (
		<Widget
			title="System Stats"
			icon={
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			}>
			<div className="space-y-3">
				<StatBar label="CPU" value={stats.cpu} color="bg-blue-500" />
				<StatBar label="Memory" value={stats.memory} color="bg-purple-500" />
				<StatBar label="Disk" value={stats.disk} color="bg-emerald-500" />
			</div>
			{!deviceName && (
				<p className="text-xs text-white/40 text-center mt-3">
					Select a device to view stats
				</p>
			)}
		</Widget>
	);
}
