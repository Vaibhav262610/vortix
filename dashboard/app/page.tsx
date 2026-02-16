"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Lenis from "lenis";

export default function LandingPage() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
		});

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			lenis.destroy();
		};
	}, []);

	return (
		<div className="bg-[#0d0d0f] text-white overflow-x-hidden">
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

			<Cursor mousePosition={mousePosition} />
			<Nav />
			<Hero />
			<Ticker />
			<About />
			<Features />
			<Visual />
			<CTA />
			<Footer />
		</div>
	);
}

function Cursor({
	mousePosition,
}: {
	mousePosition: { x: number; y: number };
}) {
	return (
		<motion.div
			className="hidden lg:block fixed w-4 h-4 border border-emerald-400/50 rounded-full pointer-events-none z-50 mix-blend-difference"
			animate={{
				x: mousePosition.x - 8,
				y: mousePosition.y - 8,
			}}
			transition={{
				type: "spring",
				damping: 30,
				stiffness: 200,
			}}
		/>
	);
}

function Nav() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all ${
				scrolled
					? "bg-black/20 backdrop-blur-sm border-b border-white/[0.06]"
					: ""
			}`}>
			<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between">
				<Link
					href="/"
					className="text-sm sm:text-base tracking-[0.2em] sm:tracking-[0.3em] font-medium">
					VORTIX
				</Link>

				<div className="hidden md:flex items-center gap-6 lg:gap-8">
					<Link
						href="/setup"
						className="text-xs tracking-[0.2em] text-white/60 hover:text-white transition">
						SETUP GUIDE
					</Link>
					<Link
						href="/contact"
						className="text-xs tracking-[0.2em] text-white/60 hover:text-white transition">
						CONTACT
					</Link>
					<Link
						href="/dashboard"
						className="px-4 lg:px-6 py-2 lg:py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs tracking-[0.2em] transition">
						DASHBOARD
					</Link>
				</div>

				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="md:hidden p-2 hover:bg-white/5 rounded-lg transition">
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						{mobileMenuOpen ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						)}
					</svg>
				</button>
			</div>

			{mobileMenuOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="md:hidden glass border-t border-white/[0.06] bg-black/40 backdrop-blur-xl">
					<div className="px-6 py-6 space-y-3">
						<Link
							href="/setup"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm tracking-[0.2em] text-white/70 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition">
							SETUP GUIDE
						</Link>
						<Link
							href="/contact"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm tracking-[0.2em] text-white/70 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition">
							CONTACT
						</Link>
						<Link
							href="/dashboard"
							onClick={() => setMobileMenuOpen(false)}
							className="block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm tracking-[0.2em] text-center text-white transition mt-2">
							DASHBOARD
						</Link>
					</div>
				</motion.div>
			)}
		</nav>
	);
}

function Hero() {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
	const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

	return (
		<motion.section
			ref={ref}
			style={{ y, opacity }}
			className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8">
			<div className="absolute inset-0 opacity-[0.03]">
				<svg className="w-full h-full">
					<defs>
						<pattern
							id="grid"
							width="80"
							height="80"
							patternUnits="userSpaceOnUse">
							<path
								d="M 80 0 L 0 0 0 80"
								fill="none"
								stroke="white"
								strokeWidth="1"
							/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />
				</svg>
			</div>

			<div className="relative z-10 max-w-[1600px] mx-auto w-full">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1.2, delay: 0.3 }}>
					<div className="flex justify-center mb-6 sm:mb-12 lg:mb-16">
						<div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2 glass rounded-lg border border-emerald-600/30">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
							<span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-emerald-400">
								100+ USERS ONLINE
							</span>
						</div>
					</div>

					<div className="text-center mb-8 sm:mb-16 lg:mb-20">
						<h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] leading-[0.85] font-light mb-4 sm:mb-6 tracking-tight">
							REMOTE
						</h1>
						<div className="flex items-center justify-center gap-4 sm:gap-8">
							<div className="w-12 sm:w-24 lg:w-32 h-[1px] bg-white/10" />
							<h2 className="text-[8vw] sm:text-[6vw] lg:text-[5vw] font-light italic text-emerald-400">
								Control
							</h2>
							<div className="w-12 sm:w-24 lg:w-32 h-[1px] bg-white/10" />
						</div>
					</div>

					<div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14 lg:mb-16 px-4">
						<p className="text-sm sm:text-base leading-relaxed text-white/50 tracking-wide">
							Execute commands, manage files, and control your Windows PC from
							anywhere with AI-powered natural language processing.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 max-w-md sm:max-w-none mx-auto">
						<Link
							href="/dashboard"
							className="px-8 sm:px-10 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-center">
							<span className="text-sm tracking-[0.2em]">GET STARTED</span>
						</Link>
						<Link
							href="/setup"
							className="px-8 sm:px-10 py-4 glass border border-white/10 rounded-lg text-sm tracking-[0.2em] hover:bg-white/5 transition flex items-center justify-center gap-3">
							VIEW SETUP
							<span className="text-lg">→</span>
						</Link>
					</div>
				</motion.div>

				<div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2">
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
						className="flex flex-col items-center gap-3">
						<span className="text-[10px] tracking-[0.3em] text-white/40">
							SCROLL
						</span>
						<div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent" />
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
}

function Ticker() {
	const text = "AI-POWERED • REAL-TIME • SECURE • ";

	return (
		<div className="border-y border-white/[0.06] py-4 sm:py-6 overflow-hidden glass">
			<motion.div
				animate={{ x: ["0%", "-50%"] }}
				transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
				className="flex whitespace-nowrap">
				{[...Array(20)].map((_, i) => (
					<span
						key={i}
						className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-white/30 mx-4 sm:mx-8">
						{text}
					</span>
				))}
			</motion.div>
		</div>
	);
}

function About() {
	return (
		<section className="py-16 sm:py-24 lg:py-32 xl:py-40 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1600px] mx-auto">
				<div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32">
					<div>
						<span className="text-[10px] tracking-[0.3em] text-white/40 mb-6 sm:mb-8 block">
							[001] ABOUT
						</span>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight tracking-tight">
							A new way to
							<br />
							<span className="italic text-emerald-400">control systems</span>
						</h2>
					</div>
					<div className="flex flex-col justify-end">
						<p className="text-base sm:text-lg leading-relaxed text-white/50 mb-6 sm:mb-8">
							Vortix reimagines remote system control with a focus on simplicity
							and power. Built for developers, system administrators, and power
							users who demand more from their tools.
						</p>
						<div className="flex items-center gap-4">
							<div className="w-12 h-[1px] bg-white/20" />
							<span className="text-xs tracking-[0.2em] text-white/40">
								EST. 2024
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Features() {
	const features = [
		{
			num: "01",
			title: "Remote Execution",
			desc: "Control your PC from anywhere",
			icon: (
				<svg
					className="w-5 h-5 sm:w-6 sm:h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			num: "02",
			title: "AI Commands",
			desc: "Natural language processing",
			icon: (
				<svg
					className="w-5 h-5 sm:w-6 sm:h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
		},
		{
			num: "03",
			title: "Secure Access",
			desc: "SHA-256 encryption",
			icon: (
				<svg
					className="w-5 h-5 sm:w-6 sm:h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			),
		},
		{
			num: "04",
			title: "Live Monitoring",
			desc: "Real-time output streaming",
			icon: (
				<svg
					className="w-5 h-5 sm:w-6 sm:h-6"
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
			),
		},
	];

	return (
		<section className="py-16 sm:py-24 lg:py-32 xl:py-40 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1600px] mx-auto">
				<div className="mb-12 sm:mb-20 lg:mb-32">
					<span className="text-[10px] tracking-[0.3em] text-white/40 mb-6 sm:mb-8 block">
						[002] FEATURES
					</span>
					<h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight">
						Capabilities
					</h2>
				</div>

				<div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
					{features.map((feature, i) => (
						<FeatureCard key={i} feature={feature} index={i} />
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay: index * 0.1 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="glass rounded-2xl p-6 sm:p-8 lg:p-12 border border-white/[0.06] hover:bg-white/[0.08] transition-all group cursor-pointer">
			<div className="flex items-start justify-between mb-8 sm:mb-12">
				<span className="text-4xl sm:text-5xl lg:text-6xl font-light text-white/10 group-hover:text-emerald-400/20 transition-colors">
					{feature.num}
				</span>
				<motion.div
					animate={{ rotate: isHovered ? 45 : 0 }}
					transition={{ duration: 0.3 }}
					className="text-xl sm:text-2xl text-white/40 group-hover:text-emerald-400 transition-colors">
					→
				</motion.div>
			</div>
			<div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-white/60 group-hover:text-emerald-400 transition-colors">
				{feature.icon}
				<h3 className="text-xl sm:text-2xl lg:text-3xl font-light">
					{feature.title}
				</h3>
			</div>
			<p className="text-sm sm:text-base text-white/50 tracking-wide">
				{feature.desc}
			</p>
		</motion.div>
	);
}

function Visual() {
	return (
		<section className="py-16 sm:py-24 lg:py-32 xl:py-40 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto">
				<div className="mb-8 sm:mb-16 lg:mb-20">
					<span className="text-[10px] tracking-[0.3em] text-white/40 mb-6 sm:mb-8 block">
						[003] INTERFACE
					</span>
				</div>

				<div className="relative">
					<div className="absolute -inset-6 sm:-inset-10 lg:-inset-20 bg-emerald-500/10 blur-[80px] sm:blur-[100px]" />

					<div className="relative glass rounded-xl sm:rounded-2xl border border-white/[0.06]">
						<div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-white/[0.06]">
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/20" />
								<div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/20" />
								<div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/20" />
							</div>
							<span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-white/40">
								TERMINAL
							</span>
							<div className="w-12 sm:w-20" />
						</div>
						<div className="p-6 sm:p-8 lg:p-12 font-mono text-xs sm:text-sm space-y-3 sm:space-y-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<span className="text-emerald-400">$</span>
								<span className="text-white/80">vortix start</span>
							</div>
							<div className="text-white/40 pl-6 sm:pl-8">
								→ Connected to backend
							</div>
							<div className="text-white/40 pl-6 sm:pl-8">
								→ Device authenticated: VAIBHAV-PC
							</div>
							<div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
								<span className="text-emerald-400">$</span>
								<span className="text-white/80">Ready for commands</span>
								<span className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 bg-emerald-400 animate-pulse" />
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-6 sm:gap-10 lg:gap-16 mt-12 sm:mt-20 lg:mt-32">
					{[
						{ value: "100+", label: "USERS" },
						{ value: "50K+", label: "COMMANDS" },
						{ value: "99.9%", label: "UPTIME" },
					].map((stat, i) => (
						<div key={i} className="text-center">
							<div className="text-3xl sm:text-5xl lg:text-6xl font-light mb-2 sm:mb-4 text-emerald-400">
								{stat.value}
							</div>
							<div className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-white/40">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CTA() {
	return (
		<section className="py-16 sm:py-24 lg:py-32 xl:py-40 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
			<div className="max-w-[1600px] mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}>
					<h2 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-light leading-tight mb-12 sm:mb-16 tracking-tight">
						Ready to start?
					</h2>
					<Link
						href="/dashboard"
						className="inline-block px-10 sm:px-14 lg:px-16 py-4 sm:py-5 lg:py-6 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm tracking-[0.2em] sm:tracking-[0.3em] transition">
						OPEN DASHBOARD
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t border-white/[0.06] py-12 sm:py-16 px-6 sm:px-8">
			<div className="max-w-[1600px] mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-12">
					<div>
						<div className="text-sm tracking-[0.3em] mb-2 sm:mb-3">VORTIX</div>
						<p className="text-xs tracking-[0.2em] text-white/40">
							REMOTE OS CONTROL
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-12 text-xs tracking-[0.2em]">
						<Link
							href="/setup"
							className="text-white/60 hover:text-white transition">
							SETUP GUIDE
						</Link>
						<Link
							href="/contact"
							className="text-white/60 hover:text-white transition">
							CONTACT
						</Link>
						<Link
							href="/dashboard"
							className="text-white/60 hover:text-white transition">
							DASHBOARD
						</Link>
					</div>
					<div className="text-xs tracking-[0.2em] text-white/40">© 2024</div>
				</div>
			</div>
		</footer>
	);
}
