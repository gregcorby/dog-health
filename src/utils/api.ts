import type { Message } from "../types";

async function parseResponse(
  res: Response,
  onChunk: (text: string) => void,
): Promise<void> {
  const contentType = res.headers.get("content-type") || "";

  // JSON response (Vercel production)
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    onChunk(data.text || "No response.");
    return;
  }

  // SSE stream (local dev)
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;

      try {
        const event = JSON.parse(data);
        if (event.type === "content_block_delta" && event.delta?.text) {
          onChunk(event.delta.text);
        }
        if (event.type === "error") {
          throw new Error(event.error?.message || "Stream error");
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

export async function streamChat(
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  await parseResponse(res, onChunk);
}

export async function streamResearch(
  query: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  await parseResponse(res, onChunk);
}
