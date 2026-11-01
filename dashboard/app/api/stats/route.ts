import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_WS?.replace("wss://", "https://").replace("ws://", "http://") || "http://localhost:8080";

export async function GET() {
	try {
		const { userId, getToken } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const token = await getToken();
		if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const response = await fetch(`${BACKEND_URL}/api/stats`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch stats");
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch stats" },
			{ status: 500 }
		);
	}
}
