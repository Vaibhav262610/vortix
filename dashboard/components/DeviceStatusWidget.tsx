"use client";

import { Widget } from "./Widget";

interface Device {
	deviceName: string;
	status: string;
	authenticated: boolean;
}

interface DeviceStatusWidgetProps {
	devices: Device[];
	selectedDevice: string;
	onDeviceSelect: (deviceName: string) => void;
}

export function DeviceStatusWidget({
	devices,
	selectedDevice,
	onDeviceSelect,
}: DeviceStatusWidgetProps) {
	const onlineDevices = devices.filter(
		(d) => d.status === "online" && d.authenticated,
	);
	const offlineDevices = devices.filter((d) => d.status === "offline");
	const lockedDevices = devices.filter((d) => !d.authenticated);

	return (
		<Widget
			title="Devices"
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
						d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			}>
			<div className="space-y-3">
				<div className="flex items-center justify-between text-xs">
					<span className="text-white/60 dark:text-white/60 light:text-gray-600">
						Online
					</span>
					<span className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium">
						{onlineDevices.length}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs">
					<span className="text-white/60 dark:text-white/60 light:text-gray-600">
						Offline
					</span>
					<span className="text-red-400 dark:text-red-400 light:text-red-600 font-medium">
						{offlineDevices.length}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs">
					<span className="text-white/60 dark:text-white/60 light:text-gray-600">
						Locked
					</span>
					<span className="text-orange-400 dark:text-orange-400 light:text-orange-600 font-medium">
						{lockedDevices.length}
					</span>
				</div>

				{onlineDevices.length > 0 && (
					<div className="pt-3 border-t border-white/10 dark:border-white/10 light:border-gray-200 space-y-2">
						{onlineDevices.map((device) => (
							<button
								key={device.deviceName}
								onClick={() => onDeviceSelect(device.deviceName)}
								className={`w-full text-left px-3 py-2 rounded-lg border transition ${
									selectedDevice === device.deviceName
										? "bg-emerald-500/20 border-emerald-500/50"
										: "bg-white/5 dark:bg-white/5 light:bg-gray-100 border-white/10 dark:border-white/10 light:border-gray-200 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200"
								}`}>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-emerald-400" />
									<span className="text-xs font-medium text-white/90 dark:text-white/90 light:text-gray-900">
										{device.deviceName}
									</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</Widget>
	);
}
