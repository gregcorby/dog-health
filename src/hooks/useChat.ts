import { useState, useCallback, useRef } from "react";
import type { Message } from "../types";
import { streamChat } from "../utils/api";
import { useLocalStorage } from "./useLocalStorage";

export function useChat() {
  const [messages, setMessages] = useLocalStorage<Message[]>(
    "pet-chat-history",
    [],
  );
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      setError(null);
      const userMsg: Message = { role: "user", content: text };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setStreaming(true);

      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages([...updated, assistantMsg]);

      abortRef.current = new AbortController();

      try {
        await streamChat(
          updated,
          (chunk) => {
            assistantMsg.content += chunk;
            setMessages([...updated, { ...assistantMsg }]);
          },
          abortRef.current.signal,
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          const errMsg = (e as Error).message || "Connection error";
          setError(errMsg);
          if (!assistantMsg.content) {
            assistantMsg.content = `Error: ${errMsg}`;
          }
          setMessages([...updated, { ...assistantMsg }]);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, setMessages],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, [setMessages]);

  return { messages, streaming, error, send, stop, clear };
}
