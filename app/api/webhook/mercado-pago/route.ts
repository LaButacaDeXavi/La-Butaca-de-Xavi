import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import crypto from "crypto"

const secret = process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "";

export async function POST(req: Request) {

    const rawBody = await req.text();

    const signatureHeader = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");

    if (!signatureHeader || !requestId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const parts = signatureHeader.split(",");
    const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];

    if (!ts || !v1) {
        return new Response("Unauthorized", { status: 401 });
    }

    const manifest = `${ts}.${requestId}.${rawBody}`;

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(manifest)
        .digest("hex");

    if (expectedSignature !== v1) {
        return new Response("Unauthorized", { status: 401 });
    }
    const supabase = createClient();



    return NextResponse.json('Todo ok', { status: 200 });
}