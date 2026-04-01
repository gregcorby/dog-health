import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[88%] px-5 py-3.5 ${
          isUser
            ? "bg-[#3D2B1F] text-[#FAF6F1] rounded-2xl rounded-br-sm"
            : "bg-white text-[#2C1810] rounded-2xl rounded-bl-sm shadow-sm border border-[#E8E0D6]"
        }`}
      >
        {!isUser && (
          <div className="text-[10px] font-bold tracking-wider text-[#8B7355] mb-1.5 font-sans uppercase">
            Cali's Health AI
            {isStreaming && (
              <span className="ml-2 inline-block w-1.5 h-1.5 bg-[#8B7355] rounded-full animate-pulse" />
            )}
          </div>
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm prose-stone max-w-none font-serif prose-headings:font-sans prose-headings:text-[#2C1810] prose-strong:text-[#2C1810] prose-li:marker:text-[#8B7355] prose-a:text-[#8B7355] prose-code:text-[#8B7355] prose-code:bg-[#F5F0EB] prose-code:px-1 prose-code:rounded prose-pre:bg-[#F5F0EB] prose-pre:border prose-pre:border-[#E8E0D6]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || " "}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
