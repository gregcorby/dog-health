import { useState } from "react";
import { ChatTab } from "./components/ChatTab";
import { ResearchTab } from "./components/ResearchTab";
import { useChat } from "./hooks/useChat";
import type { Tab } from "./types";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "research", label: "Discover", icon: "🔬" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const chat = useChat();

  return (
    <div className="h-screen flex flex-col bg-[#FAF6F1] font-sans">
      {/* Header */}
      <header className="px-6 py-3.5 border-b border-[#E8E0D6] shrink-0">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0937E] flex items-center justify-center text-lg">
            🐾
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#2C1810] tracking-tight">
              Cali's Health Center
            </h1>
            <p className="text-[11px] text-[#8B7355] font-medium">
              14y F/S Mixed · 14.8 kg · Modern Animal NoPa
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 tracking-wide">
              CIRRHOSIS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 tracking-wide">
              ANOREXIA
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 tracking-wide">
              HE?
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl border-none text-[13px] font-semibold cursor-pointer transition-all ${
                tab === t.id
                  ? "bg-[#3D2B1F] text-white"
                  : "bg-transparent text-[#8B7355] hover:bg-[#F5F0EB]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      {tab === "chat" ? <ChatTab chat={chat} /> : <ResearchTab />}
    </div>
  );
}
