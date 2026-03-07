"use client";

import { Widget } from "./Widget";

interface RecentCommandsWidgetProps {
	commands: string[];
	onCommandClick: (command: string) => void;
}

export function RecentCommandsWidget({
	commands,
	onCommandClick,
}: RecentCommandsWidgetProps) {
	const recentCommands = commands.slice(-5).reverse();

	return (
		<Widget
			title="Recent Commands"
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
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			}>
			<div className="space-y-2">
				{recentCommands.length === 0 ? (
					<p className="text-xs text-white/40 text-center py-4">
						No recent commands
					</p>
				) : (
					recentCommands.map((cmd, idx) => (
						<button
							key={idx}
							onClick={() => onCommandClick(cmd)}
							className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition group">
							<p className="text-xs font-mono text-white/80 group-hover:text-white truncate">
								{cmd}
							</p>
						</button>
					))
				)}
			</div>
		</Widget>
	);
}
