import { useState } from "react";
import { ChatTab } from "./components/ChatTab";
import { ResearchTab } from "./components/ResearchTab";
import { useChat } from "./hooks/useChat";
import type { Tab } from "./types";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "research", label: "Discover" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const chat = useChat();

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">Pet Health</span>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    tab === t.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Status badges */}
            <div className="hidden sm:flex gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">
                CIRRHOSIS
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                ANOREXIA
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                HE?
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab content */}
      {tab === "chat" ? <ChatTab chat={chat} /> : <ResearchTab />}
    </div>
  );
}
