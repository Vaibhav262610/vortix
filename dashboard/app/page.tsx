"use client";

import { useEffect, useState, useRef, JSX } from "react";
import { quickCommands } from "../quickCommands";

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

// Helper function to render SVG icons
const Icon = ({
	name,
	className = "w-6 h-6",
}: {
	name: string;
	className?: string;
}) => {
	const icons: Record<string, JSX.Element> = {
		"document-text": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		),
		calculator: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
			/>
		),
		"chart-bar": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		),
		terminal: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		),
		"code-bracket": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
			/>
		),
		"paint-brush": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
			/>
		),
		"folder-open": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
			/>
		),
		"cog-6-tooth": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		),
		"adjustments-horizontal": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
			/>
		),
		"computer-desktop": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
			/>
		),
		"globe-alt": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
			/>
		),
		"list-bullet": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 6h16M4 12h16M4 18h16"
			/>
		),
		"circle-stack": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
			/>
		),
		"battery-50": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-7-7H6a2 2 0 01-2-2V8a2 2 0 012-2h11v4z"
			/>
		),
		"cpu-chip": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
			/>
		),
		server: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
			/>
		),
		window: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
			/>
		),
		signal: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
			/>
		),
		"chart-bar-square": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		),
		"arrow-path": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		),
		map: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
			/>
		),
		key: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
			/>
		),
		link: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
			/>
		),
		"rectangle-stack": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
			/>
		),
		"arrow-down-tray": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
			/>
		),
		document: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
			/>
		),
		folder: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
			/>
		),
		"inbox-arrow-down": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
			/>
		),
		clock: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		),
		"x-circle": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		),
		"queue-list": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
			/>
		),
		sparkles: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
			/>
		),
		"magnifying-glass": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		),
		trash: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
			/>
		),
		"archive-box-x-mark": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4m6 2l2 2m0 0l2-2m-2 2v-6"
			/>
		),
		"chart-pie": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
			/>
		),
		"presentation-chart-line": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
			/>
		),
		"server-stack": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
			/>
		),
		cog: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		),
		"rocket-launch": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
			/>
		),
		"wrench-screwdriver": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
			/>
		),
		"device-phone-mobile": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
			/>
		),
		"document-magnifying-glass": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m5 5l-3-3m0 0a2 2 0 114 0 2 2 0 01-4 0z"
			/>
		),
		"cog-8-tooth": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		),
		calendar: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		),
		camera: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		),
		language: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
			/>
		),
		"magnifying-glass-plus": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
			/>
		),
		"command-line": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		),
		"speaker-wave": (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
			/>
		),
		tv: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10l6 2-6 2V10z"
			/>
		),
	};

	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24">
			{icons[name] || <circle cx="12" cy="12" r="10" strokeWidth={2} />}
		</svg>
	);
};

export default function Home() {
	const [isPlanning, setIsPlanning] = useState(false);
	const [isExecuting, setIsExecuting] = useState(false);
	const [planPreview, setPlanPreview] = useState<any[]>([]);
	const [approvalDialog, setApprovalDialog] = useState<ApprovalDialog>(null);
	const [authDialog, setAuthDialog] = useState<AuthDialog>(null);
	const [authPassword, setAuthPassword] = useState("");
	const [showQuickCommands, setShowQuickCommands] = useState(false);

	const [devices, setDevices] = useState<Device[]>([]);
	const [logs, setLogs] = useState<string[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<string>("");
	const [command, setCommand] = useState("");

	const wsRef = useRef<WebSocket | null>(null);
	const logsRef = useRef<HTMLDivElement | null>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	const executeQuickCommand = (cmd: string) => {
		if (!selectedDevice) {
			alert("Please select a device first");
			return;
		}

		setCommand(cmd);
		setIsExecuting(true);

		wsRef.current?.send(
			JSON.stringify({
				type: "FORCE_EXECUTE",
				deviceName: selectedDevice,
				command: cmd,
			}),
		);

		setTimeout(() => setIsExecuting(false), 1000);
	};

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

			{/* Quick Commands Modal */}
			{showQuickCommands && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="glass rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
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
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">
										Quick Commands
									</h3>
									<p className="text-xs text-white/50">
										Some pre-built commands for common tasks
									</p>
								</div>
							</div>
							<button
								onClick={() => setShowQuickCommands(false)}
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
						<div className="flex-1 overflow-y-auto p-6">
							<div className="space-y-8">
								{quickCommands.map((category, idx) => (
									<div key={idx}>
										<h4 className="text-sm font-semibold uppercase tracking-widest text-purple-400/90 mb-4 flex items-center gap-2">
											<span className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent"></span>
											{category.category}
											<span className="h-px flex-1 bg-gradient-to-l from-purple-500/50 to-transparent"></span>
										</h4>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
											{category.commands.map((cmd, cmdIdx) => (
												<button
													key={cmdIdx}
													onClick={() => {
														executeQuickCommand(cmd.command);
														setShowQuickCommands(false);
													}}
													disabled={!selectedDevice || isExecuting}
													className={`group relative flex items-start gap-3 p-4 rounded-xl border transition text-left ${
														!selectedDevice || isExecuting
															? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
															: "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/30 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10"
													}`}
													title={cmd.description}>
													<div className="flex-shrink-0 text-white/70">
														<Icon name={cmd.icon} className="w-6 h-6" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-white/90 mb-1">
															{cmd.name}
														</p>
														<p className="text-xs text-white/40 line-clamp-2">
															{cmd.description}
														</p>
													</div>
													{!selectedDevice || isExecuting ? null : (
														<svg
															className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition flex-shrink-0 absolute top-3 right-3"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M14 5l7 7m0 0l-7 7m7-7H3"
															/>
														</svg>
													)}
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Footer */}
						{!selectedDevice && (
							<div className="px-6 py-4 border-t border-white/10 bg-orange-500/5 flex-shrink-0">
								<p className="text-sm text-orange-300/80 text-center">
									⚠️ Select a device first to use quick commands
								</p>
							</div>
						)}
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

						{/* Basic Commands Section */}
						<div className="mt-4 pt-4 border-t border-white/10">
							<div className="flex items-center justify-between mb-3">
								<p className="text-xs font-medium uppercase tracking-widest text-white/45">
									Basic Commands
								</p>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() =>
										executeQuickCommand("nircmd.exe changesysvolume 2000")
									}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/30 cursor-pointer"
									}`}
									title="Increase volume">
									<svg
										className="w-6 h-6 text-white/80"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
										/>
									</svg>
									<span className="text-xs text-white/70">Volume Up</span>
								</button>
								<button
									onClick={() =>
										executeQuickCommand("nircmd.exe changesysvolume -2000")
									}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/30 cursor-pointer"
									}`}
									title="Decrease volume">
									<svg
										className="w-6 h-6 text-white/80"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
										/>
									</svg>
									<span className="text-xs text-white/70">Volume Down</span>
								</button>
								<button
									onClick={() =>
										executeQuickCommand("nircmd.exe mutesysvolume 2")
									}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/30 cursor-pointer"
									}`}
									title="Mute/Unmute">
									<svg
										className="w-6 h-6 text-white/80"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
										/>
									</svg>
									<span className="text-xs text-white/70">Mute</span>
								</button>
								<button
									onClick={() =>
										executeQuickCommand(
											"rundll32.exe user32.dll,LockWorkStation",
										)
									}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/30 cursor-pointer"
									}`}
									title="Lock PC">
									<svg
										className="w-6 h-6 text-white/80"
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
									<span className="text-xs text-white/70">Lock PC</span>
								</button>
								<button
									onClick={() => executeQuickCommand("shutdown /s /t 0")}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-red-500/[0.08] hover:border-red-500/30 cursor-pointer"
									}`}
									title="Shutdown PC">
									<svg
										className="w-6 h-6 text-white/80"
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
									<span className="text-xs text-white/70">Shutdown</span>
								</button>
								<button
									onClick={() => executeQuickCommand("shutdown /r /t 0")}
									disabled={!selectedDevice || isExecuting}
									className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
										!selectedDevice || isExecuting
											? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
											: "border-white/10 bg-white/[0.03] hover:bg-orange-500/[0.08] hover:border-orange-500/30 cursor-pointer"
									}`}
									title="Restart PC">
									<svg
										className="w-6 h-6 text-white/80"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									<span className="text-xs text-white/70">Restart</span>
								</button>
							</div>
						</div>

						{/* More Commands Button */}
						<div className="mt-4 pt-4 border-t border-white/10">
							<button
								onClick={() => setShowQuickCommands(true)}
								className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 hover:from-purple-500/20 hover:to-purple-600/20 transition group">
								<div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
									<svg
										className="w-4 h-4 text-purple-400"
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
								<div className="flex-1 text-left">
									<p className="text-sm font-medium text-purple-300 group-hover:text-purple-200 transition">
										More Commands
									</p>
									<p className="text-xs text-purple-400/60"></p>
								</div>
								<svg
									className="w-4 h-4 text-purple-400/60 group-hover:text-purple-400 transition"
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
							</button>
						</div>
					</div>

					{/* Main: command + logs */}
					<div className="flex flex-col gap-6">
						{/* Command — glass bar */}
						<div className="glass rounded-2xl p-5 sm:p-6">
							<div className="flex items-center justify-between mb-3">
								<p className="text-xs font-medium uppercase tracking-widest text-white/45">
									Send Command
								</p>
								<div className="flex items-center gap-2">
									{selectedDevice && (
										<div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600/10 border border-emerald-600/30">
											<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
											<span className="text-xs text-emerald-400 font-medium">
												{selectedDevice}
											</span>
										</div>
									)}
									<button
										onClick={() => setShowQuickCommands(true)}
										className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition text-purple-300 text-xs font-medium">
										<svg
											className="w-3.5 h-3.5"
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
										Quick Commands
									</button>
								</div>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<input
									value={command}
									onChange={(e) => setCommand(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && sendCommand()}
									placeholder={
										selectedDevice
											? "Type a command or describe what you want to do..."
											: "Select a device first..."
									}
									disabled={!selectedDevice}
									className={`glass-input flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-white/10 ${
										!selectedDevice ? "opacity-50 cursor-not-allowed" : ""
									}`}
								/>
								<button
									type="button"
									onClick={sendCommand}
									disabled={isExecuting || isPlanning || !selectedDevice}
									className={`rounded-xl px-6 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 sm:shrink-0 ${
										isExecuting || isPlanning
											? "cursor-not-allowed bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
											: !selectedDevice
												? "cursor-not-allowed bg-white/5 text-white/40 border border-white/10"
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
						<div className="glass rounded-2xl overflow-hidden flex flex-col h-[500px]">
							<div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5 flex-shrink-0">
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
									<button
										onClick={() => setLogs([])}
										className="text-xs px-2 py-1 rounded-md border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition">
										Clear
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
								className="flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed text-white/75">
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
