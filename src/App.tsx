import { useState } from "react";
import { ChatTab } from "./components/ChatTab";
import { ResearchTab } from "./components/ResearchTab";
import { useChat } from "./hooks/useChat";
import type { Tab } from "./types";

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const chat = useChat();

  return (
    <div className="h-screen flex flex-col bg-[#faf9fc] font-sans text-[#1a1625]">
      {/* Header — dark, minimal like Tiimo */}
      <header className="bg-[#1a1625] shrink-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#c4b5fd] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1a1625]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">
                Pet Health
              </span>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#2d2640] rounded-full p-1">
              {(["chat", "research"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                    tab === t
                      ? "bg-white text-[#1a1625]"
                      : "text-[#a59bc2] hover:text-white"
                  }`}
                >
                  {t === "chat" ? "Chat" : "Discover"}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="hidden sm:flex gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fecdd3]/20 text-[#fca5a5]">
                CIRRHOSIS
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fde68a]/20 text-[#fcd34d]">
                ANOREXIA
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#c4b5fd]/20 text-[#c4b5fd]">
                HE?
              </span>
            </div>
          </div>
        </div>
      </header>

      {tab === "chat" ? <ChatTab chat={chat} /> : <ResearchTab />}
    </div>
  );
}
