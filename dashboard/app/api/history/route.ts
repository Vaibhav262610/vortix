import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_WS?.replace("wss://", "https://").replace("ws://", "http://") || "http://localhost:8080";

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const deviceId = searchParams.get("deviceId");
		const search = searchParams.get("search");
		const limit = searchParams.get("limit") || "50";
		const offset = searchParams.get("offset") || "0";

		// Build query parameters
		const params = new URLSearchParams({
			userId,
			limit,
			offset,
			...(deviceId && { deviceId }),
			...(search && { search }),
		});

		// Fetch from backend
		const response = await fetch(`${BACKEND_URL}/api/history?${params}`, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch command history");
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching command history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch command history" },
			{ status: 500 }
		);
	}
}
