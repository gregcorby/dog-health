import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { CALI_SYSTEM_PROMPT, RESEARCH_SYSTEM_PROMPT } from "./prompts.js";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic();

// Chat endpoint — streams responses
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: CALI_SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
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

    // Handle client disconnect
    req.on("close", () => {
      stream.abort();
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({ type: "error", error: { message: msg } })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// Research endpoint — streams with web search tool
app.post("/api/research", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({ error: "query required" });
    return;
  }

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
    res.write(
      `data: ${JSON.stringify({ type: "error", error: { message: msg } })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
