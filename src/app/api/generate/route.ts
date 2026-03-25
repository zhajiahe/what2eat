import { NextRequest } from "next/server";
import { buildMessages } from "@/lib/prompt";
import type { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateRequest & {
    apiUrl?: string;
    apiKey?: string;
    apiModel?: string;
  };

  const apiUrl =
    body.apiUrl || "https://hazhang-octopus.zeabur.app/v1/chat/completions";
  const apiKey = body.apiKey || "";
  const model = body.apiModel || "default";
  const messages = buildMessages(body);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json(
        { error: `API error: ${resp.status} ${text}` },
        { status: 502 }
      );
    }

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          const data = trimmed.startsWith("data: ")
            ? trimmed.slice(6)
            : trimmed;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
            if (json.choices?.[0]?.finish_reason === "stop") {
              controller.close();
              return;
            }
          } catch {
            // partial line, skip
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `无法连接 API: ${message}` },
      { status: 502 }
    );
  }
}
