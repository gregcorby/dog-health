import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="mb-5">
        <p className="text-lg font-bold text-[#1a1625] leading-snug">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#c4b5fd] flex items-center justify-center">
          <svg className="w-3 h-3 text-[#1a1625]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-[#6b6380]">Answer</span>
        {isStreaming && (
          <span className="w-1.5 h-1.5 bg-[#c4b5fd] rounded-full animate-pulse" />
        )}
      </div>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#ebe8f0]">
        <div className="prose prose-sm prose-gray max-w-none prose-headings:text-[#1a1625] prose-headings:font-bold prose-p:text-[#3d3555] prose-p:leading-relaxed prose-strong:text-[#1a1625] prose-li:text-[#3d3555] prose-li:marker:text-[#c4b5fd] prose-a:text-[#8b5cf6] prose-a:no-underline hover:prose-a:underline prose-code:text-[#6b6380] prose-code:bg-[#f3f0f7] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#f3f0f7] prose-pre:border prose-pre:border-[#ebe8f0] prose-pre:rounded-2xl prose-hr:border-[#ebe8f0]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content || " "}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
