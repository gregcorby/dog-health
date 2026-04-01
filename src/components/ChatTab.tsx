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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6">
          {empty && (
            <div className="animate-fade-up pt-12 pb-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#1a1625] tracking-tight mb-3">
                  What do you want to know?
                </h2>
                <p className="text-sm text-[#6b6380] max-w-md mx-auto">
                  Full medical records loaded. Ask about conditions, medications, labs, or next steps.
                </p>
              </div>

              {/* Search bar */}
              <div className="max-w-2xl mx-auto mb-10">
                <div className="flex items-center bg-white rounded-2xl border border-[#ebe8f0] px-5 py-3.5 shadow-sm focus-within:border-[#c4b5fd] focus-within:ring-2 focus-within:ring-[#c4b5fd]/20 transition-all">
                  <svg className="w-5 h-5 text-[#9d95ad] shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    placeholder="Ask anything..."
                    className="flex-1 border-none outline-none text-[15px] bg-transparent text-[#1a1625] placeholder:text-[#9d95ad]"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim()}
                    className="ml-2 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 bg-[#1a1625] text-white hover:bg-[#2d2640]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggested queries */}
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-2.5">
                  {SUGGESTED_QUERIES.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sq.query)}
                      className="p-3.5 rounded-2xl bg-white border border-[#ebe8f0] text-left transition-all hover:border-[#c4b5fd] hover:shadow-sm flex gap-3 items-center group"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#f3f0f7] flex items-center justify-center shrink-0 group-hover:bg-[#ede9f5] transition-colors">
                        <span className="text-sm">{sq.icon}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#1a1625] group-hover:text-[#6b6380] transition-colors">
                        {sq.label}
                      </span>
                    </button>
                  ))}
                </div>
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
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#c4b5fd] flex items-center justify-center">
                <svg className="w-3 h-3 text-[#1a1625]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <TypingIndicator />
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Bottom input */}
      {!empty && (
        <div className="bg-white border-t border-[#ebe8f0] shrink-0">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 py-3">
            <div className="flex gap-2.5 items-center">
              <button
                onClick={clear}
                disabled={streaming}
                className="shrink-0 w-10 h-10 rounded-xl bg-[#f3f0f7] text-[#6b6380] hover:bg-[#ede9f5] transition-colors flex items-center justify-center disabled:opacity-40"
                title="New thread"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <div className="flex-1 flex items-center bg-[#f3f0f7] rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#c4b5fd] focus-within:ring-2 focus-within:ring-[#c4b5fd]/20 border border-transparent transition-all">
                <input
                  ref={empty ? undefined : inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask a follow-up..."
                  disabled={streaming}
                  className="flex-1 border-none outline-none text-sm bg-transparent text-[#1a1625] placeholder:text-[#9d95ad] disabled:opacity-50"
                />
                {streaming ? (
                  <button
                    onClick={stop}
                    className="shrink-0 w-8 h-8 rounded-xl bg-[#ebe8f0] text-[#6b6380] flex items-center justify-center hover:bg-[#e0dce8] transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim()}
                    className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 bg-[#1a1625] text-white hover:bg-[#2d2640]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
