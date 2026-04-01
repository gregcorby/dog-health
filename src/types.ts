export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SuggestedQuery {
  icon: string;
  label: string;
  query: string;
}

export interface ResearchTopic {
  icon: string;
  label: string;
  query: string;
}

export interface ResearchResult {
  icon: string;
  label: string;
  content: string;
  timestamp: string;
  category?: string;
}

export type Tab = "chat" | "research";
