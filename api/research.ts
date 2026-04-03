import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { RESEARCH_SYSTEM_PROMPT } from "./_prompts.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query required" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: RESEARCH_SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: query }],
    });

    stream.on("text", (text) => {
      res.write(
        `data: ${JSON.stringify({ type: "content_block_delta", delta: { text } })}\n\n`,
      );
    });

    stream.on("error", (error) => {
      res.write(
        `data: ${JSON.stringify({ type: "error", error: { message: error.message } })}\n\n`,
      );
      res.write("data: [DONE]\n\n");
      res.end();
    });

    stream.on("end", () => {
      res.write("data: [DONE]\n\n");
      res.end();
    });

    req.on("close", () => {
      stream.abort();
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      return res.status(500).json({ error: msg });
    }
    res.write(
      `data: ${JSON.stringify({ type: "error", error: { message: msg } })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
