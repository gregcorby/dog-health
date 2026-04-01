import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamResearch } from "../utils/api";
import { RESEARCH_TOPICS, FULL_RESEARCH_QUERY } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ResearchResult } from "../types";
import { TypingIndicator } from "./TypingIndicator";

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "liver", label: "Liver Disease" },
  { id: "appetite", label: "Appetite & Nutrition" },
  { id: "treatment", label: "Treatments" },
  { id: "behavior", label: "Behavior & Anxiety" },
  { id: "research", label: "New Research" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

// Map each research topic to a category
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
  "What are the best liver-support diets for dogs with cirrhosis?",
  "How do owners manage hepatic encephalopathy at home?",
  "What are signs a dog with liver disease is in pain?",
  "Mirtazapine vs Entyce for appetite in liver disease dogs",
  "SAMe and milk thistle dosing for canine liver disease",
  "When to consider euthanasia with end-stage liver disease",
  "Latest veterinary research on reversing liver fibrosis in dogs",
  "Dogs that recovered from severe liver enzyme elevation — stories",
];

export function ResearchTab() {
  const [results, setResults] = useLocalStorage<ResearchResult[]>(
    "cali-research",
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

  const scrollToResults = useCallback(() => {
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

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
      setResults((prev) => [
        { icon, label, content, timestamp: ts },
        ...prev,
      ]);
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
            icon: "❌",
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
    runResearch("Custom Search", query.trim(), "🔎");
    setCustomQuery("");
  }

  function stopResearch() {
    abortRef.current?.abort();
  }

  // Filter topics by selected category
  const filteredTopics =
    activeCategory === "all"
      ? RESEARCH_TOPICS
      : RESEARCH_TOPICS.filter((t) =>
          TOPIC_CATEGORIES[t.label]?.includes(activeCategory),
        );

  // Filter results by selected category
  const filteredResults =
    activeCategory === "all"
      ? results
      : results.filter((r) => {
          const cats = TOPIC_CATEGORIES[r.label];
          return cats ? cats.includes(activeCategory) : true;
        });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search bar */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex gap-2.5 items-center bg-white rounded-2xl border border-[#E8E0D6] pl-4.5 pr-1.5 py-1.5 shadow-sm focus-within:border-[#8B7355] transition-colors">
          <span className="text-[#A0937E] text-sm">🔍</span>
          <input
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleCustomSearch(customQuery)
            }
            placeholder="Search anything about Cali's condition..."
            disabled={loading}
            className="flex-1 border-none outline-none text-sm font-sans bg-transparent text-[#2C1810] placeholder:text-[#A0937E] disabled:opacity-50"
          />
          {loading ? (
            <button
              onClick={stopResearch}
              className="shrink-0 px-3 h-8 rounded-xl bg-red-50 text-red-500 border-none text-xs font-semibold cursor-pointer hover:bg-red-100 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => handleCustomSearch(customQuery)}
              disabled={!customQuery.trim()}
              className="shrink-0 px-3 h-8 rounded-xl border-none text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-default disabled:bg-[#E8E0D6] bg-[#3D2B1F] hover:bg-[#2C1810]"
            >
              Search
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="px-6 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeCategory === cat.id
                ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                : "bg-white text-[#8B7355] border-[#E8E0D6] hover:border-[#8B7355]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="px-6 pb-5">
        {/* Suggested searches */}
        <div className="mb-5">
          <div className="text-[11px] font-bold text-[#8B7355] tracking-wider uppercase mb-2.5">
            Suggested Searches
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SEARCHES.map((s, i) => (
              <button
                key={i}
                onClick={() => runResearch("Custom Search", s, "🔎")}
                disabled={loading}
                className="px-3 py-1.5 rounded-full bg-[#F5F0EB] text-[11px] font-medium text-[#5C4A3A] hover:bg-[#E8E0D6] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Full scan button */}
        <button
          onClick={() =>
            runResearch("Full Research Scan", FULL_RESEARCH_QUERY, "🔬")
          }
          disabled={loading}
          className={`w-full py-4 px-5 rounded-2xl border-2 font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2.5 mb-5 ${
            loading && activeLabel === "Full Research Scan"
              ? "bg-[#F5F0EB] text-[#8B7355] border-[#E8E0D6]"
              : "bg-[#3D2B1F] text-white border-[#3D2B1F] hover:bg-[#2C1810] disabled:opacity-60 disabled:cursor-wait"
          }`}
        >
          {loading && activeLabel === "Full Research Scan" ? (
            <>
              <span className="animate-pulse">🔬</span>
              Scanning Reddit, forums & research...
            </>
          ) : (
            <>🔬 Run Full Research Scan</>
          )}
        </button>

        {/* Topic cards */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-[#8B7355] tracking-wider uppercase mb-2.5">
            Research by Topic
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredTopics.map((rt, i) => (
              <button
                key={i}
                onClick={() => runResearch(rt.label, rt.query, rt.icon)}
                disabled={loading}
                className={`p-3.5 rounded-xl border text-left transition-all flex gap-3 items-start w-full group ${
                  loading && activeLabel === rt.label
                    ? "bg-[#F5F0EB] border-[#8B7355]"
                    : "bg-white border-[#E8E0D6] hover:border-[#8B7355] hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:cursor-wait"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {loading && activeLabel === rt.label ? (
                    <span className="animate-pulse">{rt.icon}</span>
                  ) : (
                    rt.icon
                  )}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[#2C1810] mb-0.5 group-hover:text-[#3D2B1F]">
                    {rt.label}
                  </div>
                  <div className="text-[11px] text-[#8B7355] leading-snug">
                    {loading && activeLabel === rt.label
                      ? "Searching..."
                      : "Reddit, forums & research"}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filteredTopics.length === 0 && (
            <p className="text-center text-xs text-[#A0937E] py-6">
              No topics in this category.
            </p>
          )}
        </div>

        {/* Streaming preview */}
        {loading && streamContent && (
          <div
            ref={resultsRef}
            className="p-5 rounded-2xl bg-white border border-[#8B7355] mb-4 shadow-sm animate-fade-up"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="animate-pulse">🔍</span>
              <span className="text-sm font-bold text-[#2C1810]">
                {activeLabel}
              </span>
              <TypingIndicator />
            </div>
            <div className="prose prose-sm prose-stone max-w-none font-serif">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {loading && !streamContent && activeLabel && (
          <div className="p-4 rounded-xl bg-[#F5F0EB] border border-[#E8E0D6] mb-4 flex items-center gap-3">
            <TypingIndicator />
            <span className="text-[13px] text-[#8B7355] font-medium">
              Researching {activeLabel}...
            </span>
          </div>
        )}

        {/* Results */}
        {filteredResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-[#8B7355] tracking-wider uppercase">
                Results ({filteredResults.length})
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setExpandedIdx(null);
                }}
                className="text-[11px] text-[#A0937E] border-none bg-transparent cursor-pointer font-medium hover:text-[#8B7355] transition-colors"
              >
                Clear All
              </button>
            </div>
            {filteredResults.map((r, i) => {
              const isExpanded = expandedIdx === i;
              const preview =
                r.content.length > 200
                  ? r.content.slice(0, 200) + "..."
                  : r.content;

              return (
                <div
                  key={`${r.label}-${r.timestamp}-${i}`}
                  className="rounded-2xl bg-white border border-[#E8E0D6] mb-3 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                >
                  {/* Card header */}
                  <div className="px-5 py-3.5 flex items-center gap-2.5">
                    <span className="text-base">{r.icon}</span>
                    <span className="text-sm font-bold text-[#2C1810] flex-1">
                      {r.label}
                    </span>
                    <span className="text-[10px] text-[#A0937E] font-medium shrink-0">
                      {r.timestamp}
                    </span>
                    <span
                      className={`text-[#A0937E] text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </div>

                  {/* Preview or full content */}
                  <div
                    className={`px-5 pb-4 ${isExpanded ? "" : "line-clamp-3"}`}
                  >
                    <div className="prose prose-sm prose-stone max-w-none font-serif prose-headings:font-sans prose-headings:text-[#2C1810]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {isExpanded ? r.content : preview}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {!isExpanded && r.content.length > 200 && (
                    <div className="px-5 pb-3">
                      <span className="text-[11px] text-[#8B7355] font-medium">
                        Click to expand
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredResults.length === 0 && !loading && (
          <div className="text-center py-10 text-[#A0937E] text-sm">
            No research results yet. Run a scan, pick a topic, or search above.
          </div>
        )}
      </div>
    </div>
  );
}
