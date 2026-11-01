import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Vortix Control Panel",
	description: "Device control and monitoring dashboard",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "#047857",
					colorPrimaryForeground: "#ffffff",
					colorBackground: "#f8fafc",
					colorForeground: "#111827",
					colorMutedForeground: "#475569",
					colorInput: "#ffffff",
					colorInputForeground: "#111827",
					colorBorder: "#cbd5e1",
					colorRing: "#10b981",
					borderRadius: "0.75rem",
				},
			}}>
			<html lang="en" className="dark">
				<body
					className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
					<Analytics />
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
