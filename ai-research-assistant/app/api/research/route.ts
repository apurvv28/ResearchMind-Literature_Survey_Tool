import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.RESEARCHMIND_API_URL ?? "http://127.0.0.1:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = String(body?.topic ?? "").trim();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 540000);

    const response = await fetch(`${BACKEND_URL}/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorPayload = await response.text();
      return NextResponse.json(
        { error: `Backend error (${response.status}): ${errorPayload}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (typeof data?.pdfUrl === "string" && data.pdfUrl.startsWith("/")) {
      data.pdfUrl = `${BACKEND_URL}${data.pdfUrl}`;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown backend failure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
