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

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
	return <div className="space-y-1"><div className="flex items-center justify-between text-xs"><span className="text-white/60">{label}</span><span className="text-white/90 font-medium">{value}%</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${color} transition-all duration-700 ease-in-out`} style={{ width: `${value}%` }} /></div></div>;
}

export function SystemStatsWidget({ deviceName, ws }: SystemStatsWidgetProps) {
	const [stats, setStats] = useState<SystemStats | null>(null);

	useEffect(() => {
		if (!ws || !deviceName) {
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			const data = JSON.parse(event.data);
			if (data.type === "SYSTEM_STATS" && data.deviceName === deviceName && data.stats) {
				setStats(data.stats);
			}
		};

		ws.addEventListener("message", handleMessage);

		// Request stats immediately
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					type: "GET_SYSTEM_STATS",
					deviceName,
				}),
			);
		}

		// A health sample every 30 seconds avoids running a disk query every second.
		const interval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(
					JSON.stringify({
						type: "GET_SYSTEM_STATS",
						deviceName,
					}),
				);
			}
		}, 30000);

		return () => {
			ws.removeEventListener("message", handleMessage);
			clearInterval(interval);
		};
	}, [ws, deviceName]);

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
			{stats ? <div className="space-y-3">
				<StatBar label="CPU" value={stats.cpu} color="bg-emerald-400" />
				<StatBar label="Memory" value={stats.memory} color="bg-teal-400" />
				<StatBar label="Disk" value={stats.disk} color="bg-emerald-500" />
			</div> : deviceName && <p className="text-xs text-white/40">Waiting for device stats…</p>}
			{stats && stats.disk >= 90 && <a href="#storage-rescue-title" className="mt-4 block rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-200 hover:bg-amber-400/15">Disk use is high ({stats.disk}%). Scan storage to find large files →</a>}
			{!deviceName && (
				<p className="text-xs text-white/40 text-center mt-3">
					Select a device to view stats
				</p>
			)}
		</Widget>
	);
}
