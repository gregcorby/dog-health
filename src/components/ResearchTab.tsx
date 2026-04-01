import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamResearch } from "../utils/api";
import { RESEARCH_TOPICS, FULL_RESEARCH_QUERY } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ResearchResult } from "../types";
import { TypingIndicator } from "./TypingIndicator";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "liver", label: "Liver" },
  { id: "appetite", label: "Appetite" },
  { id: "treatment", label: "Treatment" },
  { id: "behavior", label: "Behavior" },
  { id: "research", label: "Research" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const TOPIC_CATEGORIES: Record<string, CategoryId[]> = {
  "Hepatic Encephalopathy": ["liver", "treatment"],
  "Not Eating + Liver Disease": ["liver", "appetite"],
  "Lactulose Experiences": ["treatment", "liver"],
  "New Liver Research": ["research", "liver"],
  "Copper Hepatopathy": ["liver", "treatment"],
  "Appetite Tricks": ["appetite"],
  "Feeding Tubes": ["appetite", "treatment"],
  "Acupuncture & Alt Tx": ["treatment"],
};

const SUGGESTED_SEARCHES = [
  "Best liver-support diets for dogs with cirrhosis",
  "Managing hepatic encephalopathy at home",
  "Signs of pain in dogs with liver disease",
  "Mirtazapine vs Entyce for appetite stimulation",
  "SAMe and milk thistle dosing for canine liver disease",
  "Quality of life assessment for end-stage liver disease",
  "Reversing liver fibrosis — latest veterinary research",
  "Dogs that recovered from severe liver enzyme elevation",
];

export function ResearchTab() {
  const [results, setResults] = useLocalStorage<ResearchResult[]>(
    "pet-research",
    [],
  );
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [loading, setLoading] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function runResearch(label: string, query: string, icon: string) {
    if (loading) return;
    setLoading(true);
    setActiveLabel(label);
    setStreamContent("");
    setExpandedIdx(null);
    abortRef.current = new AbortController();

    let content = "";
    try {
      await streamResearch(
        query,
        (chunk) => {
          content += chunk;
          setStreamContent(content);
        },
        abortRef.current.signal,
      );

      const ts = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      setResults((prev) => [{ icon, label, content, timestamp: ts }, ...prev]);
      setExpandedIdx(0);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        const ts = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        setResults((prev) => [
          {
            icon: "!",
            label,
            content: content || `Error: ${(e as Error).message}`,
            timestamp: ts,
          },
          ...prev,
        ]);
      }
    } finally {
      setLoading(false);
      setActiveLabel(null);
      setStreamContent("");
      abortRef.current = null;
    }
  }

  function handleCustomSearch(query: string) {
    if (!query.trim()) return;
    runResearch("Custom Search", query.trim(), "search");
    setCustomQuery("");
  }

  function stopResearch() {
    abortRef.current?.abort();
  }

  const filteredTopics =
    activeCategory === "all"
      ? RESEARCH_TOPICS
      : RESEARCH_TOPICS.filter((t) =>
          TOPIC_CATEGORIES[t.label]?.includes(activeCategory),
        );

  const filteredResults =
    activeCategory === "all"
      ? results
      : results.filter((r) => {
          const cats = TOPIC_CATEGORIES[r.label];
          return cats ? cats.includes(activeCategory) : true;
        });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Search bar */}
        <div className="mb-5">
          <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <svg className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCustomSearch(customQuery)
              }
              placeholder="Search veterinary topics..."
              disabled={loading}
              className="flex-1 border-none outline-none text-[15px] bg-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
            />
            {loading ? (
              <button
                onClick={stopResearch}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => handleCustomSearch(customQuery)}
                disabled={!customQuery.trim()}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-blue-500 text-white hover:bg-blue-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Suggested searches */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            Suggested
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SEARCHES.map((s, i) => (
              <button
                key={i}
                onClick={() => runResearch("Custom Search", s, "search")}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[12px] text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-wait"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Full scan */}
        <button
          onClick={() =>
            runResearch("Full Research Scan", FULL_RESEARCH_QUERY, "scan")
          }
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-6 ${
            loading && activeLabel === "Full Research Scan"
              ? "bg-gray-100 text-gray-500 border border-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-wait"
          }`}
        >
          {loading && activeLabel === "Full Research Scan" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning sources...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Run Full Research Scan
            </>
          )}
        </button>

        {/* Topic cards */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            Topics
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredTopics.map((rt, i) => (
              <button
                key={i}
                onClick={() => runResearch(rt.label, rt.query, rt.icon)}
                disabled={loading}
                className={`p-3.5 rounded-xl border text-left transition-all flex gap-3 items-center w-full group ${
                  loading && activeLabel === rt.label
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm disabled:opacity-40 disabled:cursor-wait"
                }`}
              >
                <span className="text-lg shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  {rt.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-gray-800 truncate">
                    {rt.label}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {loading && activeLabel === rt.label
                      ? "Searching..."
                      : "Forums & research"}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filteredTopics.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              No topics in this category.
            </p>
          )}
        </div>

        {/* Streaming preview */}
        {loading && streamContent && (
          <div
            ref={resultsRef}
            className="bg-white rounded-xl border border-blue-200 p-5 mb-4 shadow-sm animate-fade-up"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">
                {activeLabel}
              </span>
            </div>
            <div className="prose prose-sm prose-gray max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {loading && !streamContent && activeLabel && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-500">
              Searching for {activeLabel}...
            </span>
          </div>
        )}

        {/* Results */}
        {filteredResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Results ({filteredResults.length})
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setExpandedIdx(null);
                }}
                className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {filteredResults.map((r, i) => {
                const isExpanded = expandedIdx === i;

                return (
                  <div
                    key={`${r.label}-${r.timestamp}-${i}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm cursor-pointer"
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  >
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-sm shrink-0">
                        {r.icon === "search" || r.icon === "scan" ? (
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        ) : r.icon === "!" ? (
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        ) : (
                          <span className="text-xs">{r.icon}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {r.label}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {r.timestamp}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                        <div className="prose prose-sm prose-gray max-w-none prose-headings:font-semibold">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {r.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {!isExpanded && (
                      <div className="px-5 pb-3">
                        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                          {r.content.slice(0, 150)}...
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredResults.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No results yet. Search or pick a topic above.
          </div>
        )}
      </div>
    </div>
  );
}
