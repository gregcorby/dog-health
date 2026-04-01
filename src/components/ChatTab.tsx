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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {empty && (
            <div className="animate-fade-up pt-16 pb-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                  What do you want to know?
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Full medical records loaded. Ask about conditions, medications, labs, or next steps.
                </p>
              </div>

              {/* Search bar — prominent in empty state */}
              <div className="max-w-2xl mx-auto mb-10">
                <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <svg className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    placeholder="Ask anything..."
                    className="flex-1 border-none outline-none text-[15px] bg-transparent text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim()}
                    className="ml-2 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggested queries grid */}
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUERIES.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sq.query)}
                      className="p-3 rounded-lg border border-gray-200 bg-white text-left transition-all hover:border-gray-300 hover:shadow-sm flex gap-3 items-center group"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <span className="text-base shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{sq.icon}</span>
                      <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{sq.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <TypingIndicator />
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Bottom input — hidden in empty state (shown above instead) */}
      {!empty && (
        <div className="bg-white border-t border-gray-200 shrink-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex gap-2 items-center">
              <button
                onClick={clear}
                disabled={streaming}
                className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center disabled:opacity-40"
                title="New thread"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <div className="flex-1 flex items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
                <input
                  ref={empty ? undefined : inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask a follow-up..."
                  disabled={streaming}
                  className="flex-1 border-none outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                />
                {streaming ? (
                  <button
                    onClick={stop}
                    className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim()}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-blue-500 text-white hover:bg-blue-600"
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
