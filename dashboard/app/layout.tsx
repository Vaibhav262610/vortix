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
					colorPrimary: "#10b981",
					colorBackground: "#0d0d0f",
					colorInputBackground: "#1a1a1a",
					colorInputText: "#ffffff",
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
