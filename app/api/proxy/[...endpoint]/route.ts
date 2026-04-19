import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/server-proxy";

type Context = {
  params: Promise<{ endpoint: string[] }>;
};

async function handle(request: NextRequest, method: string, context: Context) {
  const { endpoint } = await context.params;
  return proxyToBackend(request, `/${endpoint.join("/")}`, method);
}

export async function GET(request: NextRequest, context: Context) {
  return handle(request, "GET", context);
}

export async function POST(request: NextRequest, context: Context) {
  return handle(request, "POST", context);
}

export async function PATCH(request: NextRequest, context: Context) {
  return handle(request, "PATCH", context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return handle(request, "DELETE", context);
}
