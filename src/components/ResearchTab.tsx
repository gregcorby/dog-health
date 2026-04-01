import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamResearch } from "../utils/api";
import { RESEARCH_TOPICS, FULL_RESEARCH_QUERY, AUTO_LOAD_QUERIES } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ResearchResult } from "../types";
import { TypingIndicator } from "./TypingIndicator";

const CATEGORIES = [
  { id: "all", label: "All", color: "bg-[#1a1625] text-white" },
  { id: "liver", label: "Liver", color: "bg-[#fecdd3]/30 text-[#be123c]" },
  { id: "appetite", label: "Appetite", color: "bg-[#fde68a]/30 text-[#a16207]" },
  { id: "treatment", label: "Treatment", color: "bg-[#c4b5fd]/30 text-[#6d28d9]" },
  { id: "behavior", label: "Behavior", color: "bg-[#a7f3d0]/30 text-[#047857]" },
  { id: "research", label: "Research", color: "bg-[#bfdbfe]/30 text-[#1d4ed8]" },
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
  "Appetite & Nutrition": ["appetite"],
  "Treatment Updates": ["treatment"],
  "Living with Liver Disease": ["behavior"],
  "Research & Breakthroughs": ["research"],
};

const CATEGORY_COLORS: Record<string, string> = {
  liver: "bg-[#fecdd3]/30 text-[#be123c]",
  appetite: "bg-[#fde68a]/30 text-[#a16207]",
  treatment: "bg-[#c4b5fd]/30 text-[#6d28d9]",
  behavior: "bg-[#a7f3d0]/30 text-[#047857]",
  research: "bg-[#bfdbfe]/30 text-[#1d4ed8]",
};

export function ResearchTab() {
  const [results, setResults] = useLocalStorage<ResearchResult[]>(
    "pet-research",
    [],
  );
  const [hasAutoLoaded, setHasAutoLoaded] = useLocalStorage<boolean>(
    "pet-research-loaded",
    false,
  );
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [loading, setLoading] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [autoLoadProgress, setAutoLoadProgress] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-load feed on first visit
  useEffect(() => {
    if (hasAutoLoaded || results.length > 0) return;
    autoLoadFeed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function autoLoadFeed() {
    setLoading(true);
    setActiveLabel("Loading feed...");
    setHasAutoLoaded(true);

    const newResults: ResearchResult[] = [];

    for (let i = 0; i < AUTO_LOAD_QUERIES.length; i++) {
      const q = AUTO_LOAD_QUERIES[i];
      setAutoLoadProgress(i + 1);
      setActiveLabel(q.label);
      setStreamContent("");

      const controller = new AbortController();
      abortRef.current = controller;
      let content = "";

      try {
        await streamResearch(
          q.query,
          (chunk) => {
            content += chunk;
            setStreamContent(content);
          },
          controller.signal,
        );

        const ts = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const result: ResearchResult = {
          icon: q.icon,
          label: q.label,
          content,
          timestamp: ts,
          category: q.category,
        };
        newResults.push(result);
        setResults([...newResults]);
      } catch (e) {
        if ((e as Error).name === "AbortError") break;
        const ts = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        newResults.push({
          icon: "!",
          label: q.label,
          content: content || `Error: ${(e as Error).message}`,
          timestamp: ts,
          category: q.category,
        });
        setResults([...newResults]);
      }
    }

    setLoading(false);
    setActiveLabel(null);
    setStreamContent("");
    setAutoLoadProgress(0);
    abortRef.current = null;
  }

  async function runResearch(label: string, query: string, icon: string, category?: string) {
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
      setResults((prev) => [{ icon, label, content, timestamp: ts, category }, ...prev]);
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
          { icon: "!", label, content: content || `Error: ${(e as Error).message}`, timestamp: ts, category },
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
    setLoading(false);
    setActiveLabel(null);
    setStreamContent("");
    setAutoLoadProgress(0);
  }

  function getCategoryForResult(r: ResearchResult): CategoryId | undefined {
    if (r.category) return r.category as CategoryId;
    const cats = TOPIC_CATEGORIES[r.label];
    return cats?.[0];
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
          if (r.category === activeCategory) return true;
          const cats = TOPIC_CATEGORIES[r.label];
          return cats ? cats.includes(activeCategory) : false;
        });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6">
        {/* Search bar */}
        <div className="mb-5">
          <div className="flex items-center bg-white rounded-2xl border border-[#ebe8f0] px-5 py-3 shadow-sm focus-within:border-[#c4b5fd] focus-within:ring-2 focus-within:ring-[#c4b5fd]/20 transition-all">
            <svg className="w-5 h-5 text-[#9d95ad] shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              className="flex-1 border-none outline-none text-[15px] bg-transparent text-[#1a1625] placeholder:text-[#9d95ad] disabled:opacity-50"
            />
            {loading ? (
              <button
                onClick={stopResearch}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#f3f0f7] text-[#6b6380] text-xs font-semibold hover:bg-[#ebe8f0] transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => handleCustomSearch(customQuery)}
                disabled={!customQuery.trim()}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 bg-[#1a1625] text-white hover:bg-[#2d2640]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills — Tiimo style */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                activeCategory === cat.id
                  ? `${cat.color} border-transparent`
                  : "bg-white text-[#6b6380] border-[#ebe8f0] hover:border-[#c4b5fd]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Auto-load progress */}
        {loading && autoLoadProgress > 0 && (
          <div className="mb-6 animate-fade-up">
            <div className="bg-white rounded-3xl border border-[#ebe8f0] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#c4b5fd]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8b5cf6] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#1a1625]">
                    Loading your feed
                  </div>
                  <div className="text-xs text-[#6b6380]">
                    {autoLoadProgress} of {AUTO_LOAD_QUERIES.length} — {activeLabel}
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#f3f0f7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c4b5fd] rounded-full transition-all duration-500"
                  style={{ width: `${(autoLoadProgress / AUTO_LOAD_QUERIES.length) * 100}%` }}
                />
              </div>
              {streamContent && (
                <div className="mt-4 text-[13px] text-[#6b6380] line-clamp-3 leading-relaxed">
                  {streamContent.slice(0, 200)}...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deep dive topics */}
        {!loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-[#9d95ad] uppercase tracking-wider">
                Dive deeper
              </div>
              <button
                onClick={() =>
                  runResearch("Full Research Scan", FULL_RESEARCH_QUERY, "scan")
                }
                disabled={loading}
                className="text-[12px] font-semibold text-[#8b5cf6] hover:text-[#6d28d9] transition-colors disabled:opacity-40"
              >
                Scan all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {filteredTopics.map((rt, i) => {
                const cats = TOPIC_CATEGORIES[rt.label];
                const catId = cats?.[0];
                const catColor = catId ? CATEGORY_COLORS[catId] : "bg-[#f3f0f7] text-[#6b6380]";

                return (
                  <button
                    key={i}
                    onClick={() => runResearch(rt.label, rt.query, rt.icon, catId)}
                    disabled={loading}
                    className={`p-4 rounded-2xl border text-left transition-all flex gap-3 items-center w-full group ${
                      loading && activeLabel === rt.label
                        ? "bg-[#f3f0f7] border-[#c4b5fd]"
                        : "bg-white border-[#ebe8f0] hover:border-[#c4b5fd] hover:shadow-sm disabled:opacity-40 disabled:cursor-wait"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catColor}`}>
                      <span className="text-base">{rt.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#1a1625] truncate">
                        {rt.label}
                      </div>
                      <div className="text-[11px] text-[#9d95ad]">
                        {loading && activeLabel === rt.label
                          ? "Searching..."
                          : "Forums & research"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredTopics.length === 0 && (
              <p className="text-center text-sm text-[#9d95ad] py-8">
                No topics in this category.
              </p>
            )}
          </div>
        )}

        {/* Active streaming preview (non-autoload) */}
        {loading && !autoLoadProgress && streamContent && (
          <div className="bg-white rounded-3xl border border-[#c4b5fd] p-5 mb-5 shadow-sm animate-fade-up">
            <div className="flex items-center gap-2.5 mb-3">
              <svg className="w-4 h-4 text-[#8b5cf6] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-bold text-[#1a1625]">{activeLabel}</span>
            </div>
            <div className="prose prose-sm prose-gray max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {loading && !autoLoadProgress && !streamContent && activeLabel && (
          <div className="bg-white rounded-2xl border border-[#ebe8f0] p-4 mb-5 flex items-center gap-3">
            <TypingIndicator />
            <span className="text-sm text-[#6b6380]">
              Searching for {activeLabel}...
            </span>
          </div>
        )}

        {/* Results feed */}
        {filteredResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold text-[#9d95ad] uppercase tracking-wider">
                Your feed ({filteredResults.length})
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setExpandedIdx(null);
                  setHasAutoLoaded(false);
                }}
                className="text-[12px] text-[#9d95ad] hover:text-[#6b6380] transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {filteredResults.map((r, i) => {
                const isExpanded = expandedIdx === i;
                const cat = getCategoryForResult(r);
                const catObj = cat ? CATEGORIES.find((c) => c.id === cat) : null;
                const catColor = cat ? CATEGORY_COLORS[cat] : undefined;

                return (
                  <div
                    key={`${r.label}-${r.timestamp}-${i}`}
                    className="bg-white rounded-3xl border border-[#ebe8f0] overflow-hidden transition-all hover:shadow-sm cursor-pointer"
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  >
                    <div className="px-5 py-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catColor || "bg-[#f3f0f7]"}`}>
                        {r.icon === "search" || r.icon === "scan" ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        ) : r.icon === "!" ? (
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        ) : (
                          <span className="text-base">{r.icon}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1625] truncate">
                          {r.label}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {catObj && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColor}`}>
                              {catObj.label}
                            </span>
                          )}
                          <span className="text-[10px] text-[#9d95ad]">
                            {r.timestamp}
                          </span>
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#9d95ad] transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>

                    {!isExpanded && (
                      <div className="px-5 pb-4 -mt-1">
                        <p className="text-[13px] text-[#6b6380] line-clamp-2 leading-relaxed">
                          {r.content.slice(0, 180)}...
                        </p>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-[#f3f0f7] pt-4">
                        <div className="prose prose-sm prose-gray max-w-none prose-headings:text-[#1a1625] prose-headings:font-bold prose-p:text-[#3d3555] prose-li:text-[#3d3555] prose-li:marker:text-[#c4b5fd] prose-a:text-[#8b5cf6]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {r.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredResults.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-[#f3f0f7] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#9d95ad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <p className="text-sm text-[#9d95ad]">
              No results yet. Search or pick a topic above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
