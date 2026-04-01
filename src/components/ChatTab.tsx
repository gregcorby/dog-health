import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { SUGGESTED_QUERIES } from "../constants";
import type { useChat } from "../hooks/useChat";

interface Props {
  chat: ReturnType<typeof useChat>;
}

export function ChatTab({ chat }: Props) {
  const { messages, streaming, send, stop, clear } = chat;
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSend(text: string) {
    if (!text.trim() || streaming) return;
    send(text.trim());
    setInput("");
  }

  const empty = messages.length === 0;

  return (
    <>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {empty && (
          <div className="animate-fade-up">
            <div className="text-center mb-7 mt-4">
              <h2 className="text-2xl font-bold text-[#2C1810] font-serif tracking-tight mb-1.5">
                Medical Records & AI Analysis
              </h2>
              <p className="text-xs text-[#8B7355] max-w-sm mx-auto leading-relaxed">
                Full history loaded. Ask anything about conditions,
                medications, labs, or next steps.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-xl mx-auto">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq.query)}
                  className="p-3 rounded-xl border border-[#E8E0D6] bg-white text-left transition-all hover:border-[#8B7355] hover:-translate-y-0.5 hover:shadow-sm flex gap-2.5 items-center group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-base shrink-0">{sq.icon}</span>
                  <span className="text-xs font-semibold text-[#2C1810] group-hover:text-[#3D2B1F]">
                    {sq.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            message={m}
            isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
          />
        ))}

        {streaming && messages[messages.length - 1]?.content === "" && (
          <div className="pl-1">
            <TypingIndicator />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="px-6 py-3.5 border-t border-[#E8E0D6] shrink-0">
        <div className="flex gap-2 items-center">
          {messages.length > 0 && !streaming && (
            <button
              onClick={clear}
              className="shrink-0 w-9 h-9 rounded-xl border border-[#E8E0D6] bg-white text-[#8B7355] hover:border-[#8B7355] transition-colors flex items-center justify-center text-sm"
              title="New conversation"
            >
              +
            </button>
          )}
          <div className="flex-1 flex gap-2.5 items-center bg-white rounded-2xl border border-[#E8E0D6] pl-4.5 pr-1.5 py-1.5 shadow-sm focus-within:border-[#8B7355] transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSend(input)
              }
              placeholder="Ask about health records..."
              disabled={streaming}
              className="flex-1 border-none outline-none text-sm font-sans bg-transparent text-[#2C1810] placeholder:text-[#A0937E] disabled:opacity-50"
            />
            {streaming ? (
              <button
                onClick={stop}
                className="shrink-0 w-9 h-9 rounded-xl bg-red-50 text-red-500 border-none flex items-center justify-center text-sm cursor-pointer hover:bg-red-100 transition-colors"
              >
                ■
              </button>
            ) : (
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="shrink-0 w-9 h-9 rounded-xl border-none text-white flex items-center justify-center text-base transition-colors cursor-pointer disabled:cursor-default disabled:bg-[#E8E0D6] bg-[#3D2B1F] hover:bg-[#2C1810]"
              >
                ↑
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
