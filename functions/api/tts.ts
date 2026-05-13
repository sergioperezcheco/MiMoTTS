import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  MIMO_API_KEY: string;
  MIMO_BASE_URL: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const apiKey = env.MIMO_API_KEY;
  const baseUrl = env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "MIMO_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  try {
    const body = await request.text();

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body,
    });

    const respHeaders = new Headers(CORS_HEADERS);
    respHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "application/json");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
};
