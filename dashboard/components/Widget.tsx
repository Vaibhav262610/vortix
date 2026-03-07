"use client";

import { ReactNode } from "react";

interface WidgetProps {
	title: string;
	icon?: ReactNode;
	children: ReactNode;
	className?: string;
	onRemove?: () => void;
}

export function Widget({
	title,
	icon,
	children,
	className = "",
	onRemove,
}: WidgetProps) {
	return (
		<div
			className={`glass rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 p-4 ${className}`}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					{icon && <div className="text-emerald-400">{icon}</div>}
					<h3 className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
						{title}
					</h3>
				</div>
				{onRemove && (
					<button
						onClick={onRemove}
						className="h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition text-white/60 hover:text-white"
						title="Remove widget">
						<svg
							className="w-4 h-4"
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
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}
