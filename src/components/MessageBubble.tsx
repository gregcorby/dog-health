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
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-900 leading-snug">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-gray-500">Answer</span>
        {isStreaming && (
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
      <div className="prose prose-sm prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-li:text-gray-700 prose-li:marker:text-gray-400 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-hr:border-gray-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content || " "}
        </ReactMarkdown>
      </div>
    </div>
  );
}
