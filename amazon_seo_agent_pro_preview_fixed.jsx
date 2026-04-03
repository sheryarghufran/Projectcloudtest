import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Database,
  Tags,
  BadgeDollarSign,
  Map,
  Link as LinkIcon,
  MessageSquare,
  Search,
  Bot,
  Target,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileUp,
  Trash2,
  Plus,
  Package,
  LineChart,
  Layers3,
  Brain,
  Radar,
  FolderOpen,
  BarChart3,
  Clock3,
  TrendingUp,
  Boxes,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const THEME = {
  bg: "#05070b",
  panel: "#0a0d12",
  panel2: "#0f1319",
  panel3: "#131922",
  text: "#f5f7fb",
  muted: "#8d97a7",
  border: "#1c2430",
  borderSoft: "#202938",
  accent: "#ffb100",
  accent2: "#00c389",
  danger: "#ff6b57",
};

const TEAMS = [
  { code: "A", name: "Vector" },
  { code: "B", name: "Titan" },
  { code: "C", name: "Ascend" },
  { code: "D", name: "Pulse" },
  { code: "E", name: "Atlas" },
  { code: "F", name: "Vanguard" },
  { code: "G", name: "Nova" },
  { code: "H", name: "Forge" },
  { code: "I", name: "Summit" },
];

const DEFAULT_SETTINGS = {
  brandName: "Project Cloud",
  openaiModel: "gpt-5.4",
  openaiApiKey: "",
  backendUrl: "",
  useBackendProxy: true,
  liveResearchEnabled: false,
  reasoningEffort: "medium",
  jungleScoutApiKey: "",
  jungleScoutBaseUrl: "",
  helium10ApiKey: "",
  helium10BaseUrl: "",
  rankTrackingEnabled: true,
  autoResolveParent: true,
  preferredDataSource: "uploaded",
};

const DEMO_ROWS = [
  { parent_asin: "B0PARENT01", asin: "B0CHILD001", title: "Project Cloud Recovery Sandal", team: "A", style: "Black / 10", keyword: "recovery sandals", organic_rank: 11, competitor_asin: "B0COMP001", sponsored_keyword: "recovery sandals", sponsored_rank: 2, source: "demo" },
  { parent_asin: "B0PARENT01", asin: "B0CHILD001", title: "Project Cloud Recovery Sandal", team: "A", style: "Black / 10", keyword: "orthopedic slides", organic_rank: 15, competitor_asin: "B0COMP001", sponsored_keyword: "orthopedic slides", sponsored_rank: 3, source: "demo" },
  { parent_asin: "B0PARENT01", asin: "B0CHILD002", title: "Project Cloud Recovery Sandal", team: "A", style: "Black / 11", keyword: "men recovery slippers", organic_rank: 14, competitor_asin: "B0COMP002", sponsored_keyword: "slides for men", sponsored_rank: 5, source: "demo" },
  { parent_asin: "B0PARENT01", asin: "B0CHILD003", title: "Project Cloud Recovery Sandal", team: "A", style: "Grey / 10", keyword: "comfort sandals", organic_rank: 19, competitor_asin: "B0COMP002", sponsored_keyword: "comfort sandals", sponsored_rank: 4, source: "demo" },
  { parent_asin: "B0PARENT01", asin: "B0CHILD004", title: "Project Cloud Recovery Sandal", team: "A", style: "Grey / 11", keyword: "arch support sandals", organic_rank: 23, competitor_asin: "B0COMP003", sponsored_keyword: "arch support sandals", sponsored_rank: 7, source: "demo" },
];

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeAsin(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function isAsin(value) {
  return /^[A-Z0-9]{10}$/.test(normalizeAsin(value));
}

function toNumberOrNull(value) {
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values) {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function parseDelimited(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const delimiter = lines[0].includes("	") ? "	" : ",";

  const parseLine = (line) => {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = parseLine(lines[0]).map((header) => header.replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || "").replace(/^"|"$/g, "");
      return acc;
    }, {});
  });
}

function findColumn(columns, candidates) {
  const normalized = columns.map((column) => ({ original: column, lowered: column.toLowerCase().trim() }));
  for (const candidate of candidates) {
    const exact = normalized.find((column) => column.lowered === candidate);
    if (exact) return exact.original;
    const partial = normalized.find((column) => column.lowered.includes(candidate));
    if (partial) return partial.original;
  }
  return null;
}

function parseUploadFile(fileName, text) {
  if (/\.(md|markdown)$/i.test(fileName)) {
    return { rows: [], docs: [{ name: fileName, content: text, type: "markdown" }] };
  }

  if (/\.json$/i.test(fileName)) {
    const parsed = JSON.parse(text);
    return { rows: Array.isArray(parsed) ? parsed : [parsed], docs: [] };
  }

  if (/\.(csv|tsv|txt)$/i.test(fileName)) {
    return { rows: parseDelimited(text), docs: [] };
  }

  return { rows: [], docs: [] };
}

function scoreKeyword({ keyword, avgRank, childCoverage, sponsoredPressure, occurrences }) {
  const text = String(keyword || "").toLowerCase();
  let score = 40;
  if (text.includes("recovery") || text.includes("orthopedic") || text.includes("support")) score += 14;
  if (text.includes("slide") || text.includes("sandal") || text.includes("slipper")) score += 10;
  if (typeof avgRank === "number") score += Math.max(0, 35 - avgRank);
  score += Math.min(15, (childCoverage || 0) * 3);
  score += Math.min(10, (occurrences || 0) * 2);
  if (sponsoredPressure) score += 12;
  return Math.max(1, Math.min(100, Math.round(score)));
}

function analyzeDataset(rows) {
  if (!rows.length) {
    return {
      columns: [],
      parents: {},
      childToParentMap: {},
      orphanRows: 0,
      stats: { rows: 0, parentCount: 0, childCount: 0, keywordCount: 0, competitorRefs: 0, docCount: 0 },
    };
  }

  const columns = Object.keys(rows[0] || {});
  const asinCol = findColumn(columns, ["asin", "child asin", "sku asin", "child_asin"]);
  const parentCol = findColumn(columns, ["parent asin", "parent", "variation parent", "parent_asin"]);
  const titleCol = findColumn(columns, ["title", "product name", "listing title"]);
  const teamCol = findColumn(columns, ["team"]);
  const styleCol = findColumn(columns, ["style", "variation", "size", "color"]);
  const keywordCol = findColumn(columns, ["keyword", "search term", "query", "search_query"]);
  const rankCol = findColumn(columns, ["organic rank", "rank", "position", "organic_rank"]);
  const competitorCol = findColumn(columns, ["competitor asin", "rival asin", "competitor", "competitor_asin"]);
  const sponsoredCol = findColumn(columns, ["sponsored keyword", "ad keyword", "ppc keyword", "sponsored_keyword"]);
  const sponsoredRankCol = findColumn(columns, ["sponsored rank", "ad rank", "sponsored_rank"]);
  const brandCol = findColumn(columns, ["brand"]);
  const dateCol = findColumn(columns, ["date", "snapshot date", "tracked at", "timestamp", "day"]);

  const parents = {};
  const childToParentMap = {};
  let orphanRows = 0;

  rows.forEach((row, index) => {
    const childAsin = normalizeAsin(asinCol ? row[asinCol] : "");
    const parentAsin = normalizeAsin(parentCol ? row[parentCol] : "") || childAsin;
    const keyword = String(keywordCol ? row[keywordCol] || "" : "").trim();
    const title = String(titleCol ? row[titleCol] || "Untitled listing" : "Untitled listing").trim();
    const style = String(styleCol ? row[styleCol] || "Default" : "Default").trim();
    const team = String(teamCol ? row[teamCol] || "A" : "A").trim();
    const brand = String(brandCol ? row[brandCol] || "Unknown brand" : "Unknown brand").trim();
    const organicRank = toNumberOrNull(rankCol ? row[rankCol] : null);
    const competitorAsin = normalizeAsin(competitorCol ? row[competitorCol] : "");
    const sponsoredKeyword = String(sponsoredCol ? row[sponsoredCol] || "" : "").trim();
    const sponsoredRank = toNumberOrNull(sponsoredRankCol ? row[sponsoredRankCol] : null);
    const trackedAt = String(dateCol ? row[dateCol] || "" : "").trim() || `row-${index + 1}`;

    if (!parentAsin && !childAsin) {
      orphanRows += 1;
      return;
    }

    if (!parents[parentAsin]) {
      parents[parentAsin] = {
        parentAsin,
        title,
        brand,
        team,
        children: {},
        keywordMap: {},
        competitorMap: {},
        snapshots: [],
        rowCount: 0,
      };
    }

    const parent = parents[parentAsin];
    parent.rowCount += 1;

    if (childAsin) {
      childToParentMap[childAsin] = parentAsin;
      if (!parent.children[childAsin]) {
        parent.children[childAsin] = {
          asin: childAsin,
          style,
          title,
          ranks: [],
          keywords: [],
          sponsoredKeywords: [],
          trackedAt: [],
        };
      }
      const child = parent.children[childAsin];
      if (typeof organicRank === "number") child.ranks.push(organicRank);
      if (keyword) child.keywords.push(keyword);
      if (sponsoredKeyword) child.sponsoredKeywords.push(sponsoredKeyword);
      child.trackedAt.push(trackedAt);
    }

    if (keyword) {
      if (!parent.keywordMap[keyword]) {
        parent.keywordMap[keyword] = {
          keyword,
          ranks: [],
          children: new Set(),
          sponsoredPressure: false,
          occurrences: 0,
        };
      }
      parent.keywordMap[keyword].occurrences += 1;
      if (typeof organicRank === "number") parent.keywordMap[keyword].ranks.push(organicRank);
      if (childAsin) parent.keywordMap[keyword].children.add(childAsin);
    }

    if (sponsoredKeyword) {
      if (!parent.keywordMap[sponsoredKeyword]) {
        parent.keywordMap[sponsoredKeyword] = {
          keyword: sponsoredKeyword,
          ranks: [],
          children: new Set(),
          sponsoredPressure: true,
          occurrences: 0,
        };
      }
      parent.keywordMap[sponsoredKeyword].sponsoredPressure = true;
      parent.keywordMap[sponsoredKeyword].occurrences += 1;
      if (typeof sponsoredRank === "number") parent.keywordMap[sponsoredKeyword].ranks.push(sponsoredRank);
      if (childAsin) parent.keywordMap[sponsoredKeyword].children.add(childAsin);
    }

    if (competitorAsin) {
      if (!parent.competitorMap[competitorAsin]) {
        parent.competitorMap[competitorAsin] = {
          asin: competitorAsin,
          terms: new Set(),
          hits: 0,
        };
      }
      parent.competitorMap[competitorAsin].hits += 1;
      if (sponsoredKeyword) parent.competitorMap[competitorAsin].terms.add(sponsoredKeyword);
      if (keyword) parent.competitorMap[competitorAsin].terms.add(keyword);
    }
  });

  Object.values(parents).forEach((parent) => {
    const children = Object.values(parent.children).map((child) => ({
      ...child,
      averageRank: average(child.ranks),
      bestRank: child.ranks.length ? Math.min(...child.ranks) : null,
      worstRank: child.ranks.length ? Math.max(...child.ranks) : null,
      keywordCount: uniqueStrings(child.keywords).length,
      sponsoredKeywordCount: uniqueStrings(child.sponsoredKeywords).length,
    }));

    const processedKeywords = Object.values(parent.keywordMap)
      .map((item) => ({
        keyword: item.keyword,
        avgRank: average(item.ranks),
        bestRank: item.ranks.length ? Math.min(...item.ranks) : null,
        childCoverage: item.children.size,
        occurrences: item.occurrences,
        sponsoredPressure: item.sponsoredPressure,
      }))
      .sort((a, b) => scoreKeyword(b) - scoreKeyword(a));

    const competitors = Object.values(parent.competitorMap)
      .map((competitor) => ({
        asin: competitor.asin,
        hits: competitor.hits,
        terms: Array.from(competitor.terms).slice(0, 8),
      }))
      .sort((a, b) => b.hits - a.hits);

    const allRanks = children.flatMap((child) => child.ranks || []).filter((value) => typeof value === "number");
    parent.children = children.sort((a, b) => (a.averageRank ?? 999) - (b.averageRank ?? 999));
    parent.keywords = processedKeywords.map((item) => ({
      ...item,
      score: scoreKeyword(item),
      priority: scoreKeyword(item) >= 75 ? "high" : scoreKeyword(item) >= 55 ? "medium" : "low",
    }));
    parent.competitors = competitors;
    parent.variationCount = children.length;
    parent.averageRank = average(allRanks);
    parent.bestRank = allRanks.length ? Math.min(...allRanks) : null;
    parent.keywordCount = processedKeywords.length;
    parent.sponsoredKeywordCount = processedKeywords.filter((item) => item.sponsoredPressure).length;
    parent.trackedCoverage = children.length ? Math.round((children.filter((child) => child.averageRank !== null).length / children.length) * 100) : 0;
    parent.snapshots = [
      {
        trackedAt: new Date().toISOString(),
        averageRank: parent.averageRank,
        bestRank: parent.bestRank,
        keywordCount: parent.keywordCount,
        variationCount: parent.variationCount,
      },
    ];
  });

  const parentList = Object.values(parents);

  return {
    columns,
    parents,
    parentList,
    childToParentMap,
    orphanRows,
    stats: {
      rows: rows.length,
      parentCount: parentList.length,
      childCount: parentList.reduce((sum, item) => sum + item.variationCount, 0),
      keywordCount: parentList.reduce((sum, item) => sum + item.keywordCount, 0),
      competitorRefs: parentList.reduce((sum, item) => sum + item.competitors.length, 0),
      docCount: 0,
    },
  };
}

function buildActionPlan(record, cadence) {
  if (!record) return null;
  const topKeywords = record.keywords.slice(0, cadence === "hourly" ? 6 : 10);
  const conquestTerms = uniqueStrings(record.competitors.flatMap((item) => item.terms || [])).slice(0, 6);
  const weakestChildren = [...record.children]
    .filter((child) => child.averageRank !== null)
    .sort((a, b) => (b.averageRank ?? 0) - (a.averageRank ?? 0))
    .slice(0, 3);

  return {
    summary: `${record.parentAsin} has ${record.variationCount} tracked child ASINs, ${record.keywordCount} processed keywords, and an average tracked rank of ${record.averageRank ?? "not available"}. The biggest opportunity is to tighten parent relevance around the highest scoring keyword cluster and close coverage gaps across weaker children.`,
    keywordPushes: topKeywords.map((item) => ({
      ...item,
      action: item.priority === "high" ? "Defend with exact match, title coverage, and strongest converting child ASIN." : "Use phrase support and backend term reinforcement.",
      reason: item.sponsoredPressure
        ? "Competitor or sponsored pressure is visible on this term."
        : item.childCoverage < Math.max(2, Math.ceil(record.variationCount / 2))
        ? "Coverage is too narrow across child variations."
        : "This keyword is relevant and already proving traction.",
    })),
    listingFixes: [
      "Standardize the parent title so the lead keyword appears earlier and matches the highest scoring search term cluster.",
      "Bring weak children up to parity by mirroring the strongest bullet relevance and image coverage.",
      "Expand backend terms with child-level synonyms that appear in uploads but are missing from visible copy.",
    ],
    ppcMoves: [
      "Split exact-match defense for the top three high-score terms.",
      conquestTerms.length ? `Build a conquest set around: ${conquestTerms.join(", ")}.` : "Competitor conquest is limited until more rival data is uploaded.",
      weakestChildren.length ? `Reduce drag from weak children first: ${weakestChildren.map((child) => child.asin).join(", ")}.` : "No weak child set identified yet.",
    ],
    risks: [
      record.trackedCoverage < 100 ? `Only ${record.trackedCoverage}% of child ASINs have usable rank tracking data.` : "Tracking coverage is solid across the current family.",
      record.sponsoredKeywordCount > 0 ? `${record.sponsoredKeywordCount} tracked keywords show sponsored pressure.` : "Sponsored pressure is not clearly mapped yet.",
      weakestChildren.length ? `The weakest tracked child set is ${weakestChildren.map((child) => child.asin).join(", ")}.` : "Weak child drag is not obvious yet.",
    ],
    nextActions: [
      "Refresh rankings on the chosen cadence and store snapshots for trend comparisons.",
      "Push parent copy changes first, then promote the best child in PPC.",
      "Ask the agent product-specific questions after selecting a parent ASIN to get contextual answers.",
    ],
  };
}

function answerQuestionLocally({ question, record, plan }) {
  if (!record) {
    return "Select a tracked parent ASIN first so I can answer with parent-level context, child rankings, and processed keywords.";
  }

  const q = String(question || "").toLowerCase();
  const bestChild = [...record.children].filter((child) => child.averageRank !== null).sort((a, b) => (a.averageRank ?? 999) - (b.averageRank ?? 999))[0];
  const weakChild = [...record.children].filter((child) => child.averageRank !== null).sort((a, b) => (b.averageRank ?? 0) - (a.averageRank ?? 0))[0];
  const topKeyword = record.keywords[0];
  const conquestTerms = uniqueStrings(record.competitors.flatMap((item) => item.terms || [])).slice(0, 4);

  if (q.includes("budget") || q.includes("best child") || q.includes("which child")) {
    return bestChild
      ? `Start with ${bestChild.asin}. It has the strongest average tracked rank at ${bestChild.averageRank}, which makes it the best candidate to carry PPC spend while the rest of the family catches up.`
      : "I do not have enough child-level rank data yet to recommend the budget winner. Upload more ranking rows for the family.";
  }

  if (q.includes("title") || q.includes("listing") || q.includes("copy")) {
    return `${record.parentAsin} should tighten title relevance around ${topKeyword?.keyword || "the strongest keyword cluster"}. The fastest win is to place the lead keyword earlier and standardize bullet relevance across weak children like ${weakChild?.asin || "the lagging variants"}.`;
  }

  if (q.includes("competitor") || q.includes("conquest") || q.includes("ppc")) {
    return conquestTerms.length
      ? `The best conquest start is ${conquestTerms.join(", ")}. Those terms repeat in competitor pressure data and should be isolated into their own conquest campaigns.`
      : "Competitor conquest is thin right now because the uploaded data does not contain enough rival term coverage.";
  }

  if (q.includes("keyword") || q.includes("rank") || q.includes("track")) {
    return `${record.parentAsin} is tracking ${record.keywordCount} processed keywords across ${record.variationCount} children. The top term right now is ${topKeyword?.keyword || "not available"}${topKeyword?.avgRank ? ` with an average observed rank of ${topKeyword.avgRank}` : ""}.`;
  }

  return plan
    ? `${plan.summary} The highest-value keyword right now is ${topKeyword?.keyword || "not available"}. ${bestChild ? `Your strongest child is ${bestChild.asin}.` : ""}`
    : `I have context for ${record.parentAsin}, but you need to run analysis first to get the latest action plan.`;
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function extractTextOutput(payload) {
  if (!payload) return "";
  if (typeof payload.output_text === "string") return payload.output_text;
  const pieces = [];
  (payload.output || []).forEach((item) => {
    (item.content || []).forEach((content) => {
      if (content.type === "output_text" && typeof content.text === "string") pieces.push(content.text);
      if (content.type === "text" && typeof content.text === "string") pieces.push(content.text);
    });
  });
  return pieces.join("\n");
}

async function callBackend({ settings, route, payload }) {
  if (!settings.backendUrl) {
    throw new Error("Backend URL is missing. Add your deployed API URL in APIs.");
  }
  const url = `${settings.backendUrl.replace(/\/$/, "")}${route}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data?.error || `Request failed with ${response.status}`);
  return data;
}

async function callOpenAIDirect({ settings, instructions, input, expectJson = false }) {
  if (!settings.openaiApiKey) throw new Error("OpenAI API key missing.");
  const body = {
    model: settings.openaiModel || "gpt-5.4",
    reasoning: { effort: settings.reasoningEffort || "medium" },
    instructions,
    input,
  };
  if (expectJson) body.text = { format: { type: "json_object" } };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await safeJson(response);
  if (!response.ok) throw new Error(data?.error?.message || data?.error || "OpenAI request failed.");
  return { text: extractTextOutput(data), raw: data };
}

function DarkPanel({ children, className = "" }) {
  return (
    <div className={cn("rounded-2xl border", className)} style={{ backgroundColor: THEME.panel, borderColor: THEME.border }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <DarkPanel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: THEME.muted }}>{label}</div>
          <div className="mt-2 text-2xl font-semibold" style={{ color: THEME.text }}>{value}</div>
          {sub ? <div className="mt-1 text-xs" style={{ color: THEME.muted }}>{sub}</div> : null}
        </div>
        {Icon ? <Icon className="h-5 w-5" style={{ color: THEME.accent }} /> : null}
      </div>
    </DarkPanel>
  );
}

function TopBarBadge({ children, tone = "default" }) {
  const styles = tone === "success"
    ? { backgroundColor: "rgba(0,195,137,0.1)", color: THEME.accent2, borderColor: "rgba(0,195,137,0.18)" }
    : { backgroundColor: THEME.panel3, color: THEME.muted, borderColor: THEME.border };
  return <div className="rounded-full border px-4 py-2 text-xs font-medium" style={styles}>{children}</div>;
}

export default function AmazonSeoAgentPro() {
  const fileRef = useRef(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [rows, setRows] = useState([]);
  const [team, setTeam] = useState("A");
  const [cadence, setCadence] = useState("hourly");
  const [asinInput, setAsinInput] = useState("");
  const [trackedParents, setTrackedParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Upload search term reports, rank exports, or markdown strategy docs. The agent will resolve parent-child relationships and process keywords per parent ASIN.");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Upload ranking or keyword data, select a parent ASIN, and ask me anything about keyword priorities, weak children, competitor pressure, or PPC actions.",
    },
  ]);

  const dataset = useMemo(() => analyzeDataset(rows.length ? rows : DEMO_ROWS), [rows]);
  const parentList = dataset.parentList || [];
  const currentRecord = useMemo(() => (selectedParent ? dataset.parents[selectedParent] || null : null), [dataset, selectedParent]);

  const navItems = [
    { key: "upload", label: "Upload", icon: Upload },
    { key: "data", label: "Data", icon: Database },
    { key: "keywords", label: "Keywords", icon: Tags },
    { key: "ppc", label: "PPC Strategy", icon: BadgeDollarSign },
    { key: "roadmap", label: "Roadmap", icon: Map },
    { key: "apis", label: "APIs", icon: LinkIcon },
    { key: "agent", label: "Ask Agent", icon: MessageSquare },
  ];

  async function ingestFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    setError("");
    let parsedRows = [];
    let parsedDocs = [];

    for (const file of incoming) {
      try {
        const text = await file.text();
        const parsed = parseUploadFile(file.name, text);
        parsedRows = parsedRows.concat(parsed.rows || []);
        parsedDocs = parsedDocs.concat(parsed.docs || []);
      } catch (err) {
        setError(`Could not parse ${file.name}: ${err.message}`);
      }
    }

    setRows((prev) => prev.concat(parsedRows));
    setDocs((prev) => prev.concat(parsedDocs));
    setFiles((prev) => prev.concat(incoming.map((file) => ({ name: file.name, size: file.size, type: file.type || "unknown" }))));
    setStatus(`Loaded ${incoming.length} file${incoming.length > 1 ? "s" : ""}, ${parsedRows.length} rows, and ${parsedDocs.length} docs. Parent keyword processing is ready.`);
    setActiveTab("data");
    if (fileRef.current) fileRef.current.value = "";
  }

  function resolveParentAsin(rawAsin) {
    const asin = normalizeAsin(rawAsin);
    if (!asin) return null;
    if (dataset.parents[asin]) return asin;
    if (dataset.childToParentMap[asin]) return dataset.childToParentMap[asin];
    return asin;
  }

  function addTrackedParent() {
    const asin = normalizeAsin(asinInput);
    if (!isAsin(asin)) {
      setError("Enter a valid 10-character ASIN.");
      return;
    }
    const parentAsin = resolveParentAsin(asin);
    const record = dataset.parents[parentAsin];

    const item = {
      parentAsin,
      requestAsin: asin,
      title: record?.title || "Unresolved parent shell",
      team,
      cadence,
      trackedAt: new Date().toISOString(),
      trackedChildren: record?.variationCount || 0,
      trackedKeywords: record?.keywordCount || 0,
      source: record ? "resolved" : "manual",
    };

    setTrackedParents((prev) => (prev.some((entry) => entry.parentAsin === parentAsin && entry.cadence === cadence) ? prev : [item, ...prev]));
    setSelectedParent(parentAsin);
    setAsinInput("");
    setError("");
    setStatus(record ? `Tracking ${parentAsin} with ${record.variationCount} children and ${record.keywordCount} processed keywords.` : `Tracking ${parentAsin}. Upload family data to resolve children and keywords.`);
    setActiveTab("keywords");
  }

  function clearWorkspace() {
    setFiles([]);
    setDocs([]);
    setRows([]);
    setTrackedParents([]);
    setSelectedParent("");
    setPlan(null);
    setError("");
    setStatus("Workspace cleared.");
    if (fileRef.current) fileRef.current.value = "";
  }

  function runTrackingAnalysis() {
    if (!currentRecord) {
      setError("Select a tracked parent ASIN first.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Processing parent ASIN, child rankings, and keyword clusters...");

    try {
      const nextPlan = buildActionPlan(currentRecord, cadence);
      setPlan(nextPlan);
      setStatus(`Processed ${currentRecord.parentAsin}: ${currentRecord.variationCount} children, ${currentRecord.keywordCount} keywords, ${currentRecord.competitors.length} competitor references.`);
      setActiveTab("ppc");
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Tracking refreshed for ${currentRecord.parentAsin}. I processed ${currentRecord.keywordCount} keywords across ${currentRecord.variationCount} child ASINs.` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    const message = chatPrompt.trim();
    if (!message) return;
    setChatPrompt("");
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);

    const localAnswer = answerQuestionLocally({ question: message, record: currentRecord, plan });

    if (!settings.liveResearchEnabled || (!settings.openaiApiKey && !settings.backendUrl)) {
      setChatHistory((prev) => [...prev, { role: "assistant", content: localAnswer }]);
      return;
    }

    try {
      if (settings.useBackendProxy) {
        const response = await callBackend({
          settings,
          route: "/api/amazon/chat",
          payload: {
            model: settings.openaiModel,
            question: message,
            record: currentRecord,
            plan,
            trackedParents,
            integrations: {
              jungleScoutConfigured: Boolean(settings.jungleScoutApiKey && settings.jungleScoutBaseUrl),
              helium10Configured: Boolean(settings.helium10ApiKey && settings.helium10BaseUrl),
            },
          },
        });
        setChatHistory((prev) => [...prev, { role: "assistant", content: response.answer || localAnswer }]);
      } else {
        const response = await callOpenAIDirect({
          settings,
          instructions: "You are an Amazon SEO and PPC operator. Answer with direct, data-grounded recommendations only.",
          input: `Current parent record: ${JSON.stringify(currentRecord, null, 2)}
Action plan: ${JSON.stringify(plan, null, 2)}
Tracked parents: ${JSON.stringify(trackedParents, null, 2)}
User question: ${message}`,
          expectJson: false,
        });
        setChatHistory((prev) => [...prev, { role: "assistant", content: response.text || localAnswer }]);
      }
    } catch {
      setChatHistory((prev) => [...prev, { role: "assistant", content: `Live mode failed. Local answer: ${localAnswer}` }]);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
      <div className="border-b" style={{ borderColor: THEME.border }}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold" style={{ background: "linear-gradient(180deg,#ff9d24,#ff6b2d)", color: "#111" }}>
              P
            </div>
            <div>
              <div className="text-[18px] font-semibold">Project Cloud <span style={{ color: THEME.muted, fontWeight: 500 }}>— Amazon SEO Agent</span></div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: THEME.muted }}>
                Catalog Manager • PPC Analyst • Keyword Intelligence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TopBarBadge tone={files.length || rows.length ? "success" : "default"}>{rows.length ? `${rows.length} rows` : "NO DATA"}</TopBarBadge>
            <TopBarBadge>{docs.length ? `${docs.length} docs` : "NO DOCS"}</TopBarBadge>
          </div>
        </div>
      </div>

      <div className="border-b" style={{ borderColor: THEME.border }}>
        <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-4 py-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className="flex items-center gap-2 border-b-2 px-5 py-4 text-[15px] font-medium transition"
                style={{
                  borderColor: active ? THEME.accent : "transparent",
                  color: active ? THEME.accent : THEME.muted,
                }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] p-5 md:p-7">
        {(status || error) && (
          <div className="mb-6 space-y-3">
            {status ? (
              <Alert className="border" style={{ backgroundColor: THEME.panel, borderColor: THEME.border, color: THEME.text }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: THEME.accent2 }} />
                <AlertTitle>Ready</AlertTitle>
                <AlertDescription style={{ color: THEME.muted }}>{status}</AlertDescription>
              </Alert>
            ) : null}
            {error ? (
              <Alert className="border" style={{ backgroundColor: THEME.panel, borderColor: "rgba(255,107,87,0.35)", color: THEME.text }}>
                <AlertCircle className="h-4 w-4" style={{ color: THEME.danger }} />
                <AlertTitle>Issue</AlertTitle>
                <AlertDescription style={{ color: THEME.muted }}>{error}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Parents" value={dataset.stats.parentCount} sub="resolved families" icon={Layers3} />
          <StatCard label="Children" value={dataset.stats.childCount} sub="tracked child ASINs" icon={Boxes} />
          <StatCard label="Keywords" value={dataset.stats.keywordCount} sub="processed parent keywords" icon={Target} />
          <StatCard label="Competitors" value={dataset.stats.competitorRefs} sub="rival references" icon={Radar} />
        </div>

        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.json,.md,.markdown" multiple className="hidden" onChange={(e) => ingestFiles(e.target.files)} />

        {activeTab === "upload" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-4xl font-semibold">Upload Your Data</h1>
              <p className="mt-3 text-lg" style={{ color: THEME.muted }}>
                Upload CSV keyword reports, search term reports, or markdown strategy docs. The agent handles structured datasets and uses them to track parent ASINs properly.
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                ingestFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[270px] cursor-pointer items-center justify-center rounded-[26px] border border-dashed p-8 text-center transition"
              style={{
                borderColor: dragActive ? THEME.accent : THEME.borderSoft,
                backgroundColor: dragActive ? "rgba(255,177,0,0.04)" : THEME.bg,
              }}
            >
              <div>
                <Plus className="mx-auto h-10 w-10" style={{ color: THEME.muted }} />
                <div className="mt-6 text-2xl font-semibold">Drop files or click to upload</div>
                <div className="mt-3 text-base" style={{ color: THEME.muted }}>
                  CSV • TSV • TXT • Markdown — Amazon Search Term Reports, Helium 10 exports, Jungle Scout data, etc.
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
              <DarkPanel className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">Uploaded assets</div>
                    <div className="text-sm" style={{ color: THEME.muted }}>Files and docs loaded into the workspace.</div>
                  </div>
                  <Button variant="outline" onClick={clearWorkspace} className="border" style={{ borderColor: THEME.border, color: THEME.text }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {files.length ? files.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}>
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4" style={{ color: THEME.accent }} />
                        <div>
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs" style={{ color: THEME.muted }}>{Math.round(file.size / 1024)} KB</div>
                        </div>
                      </div>
                      <Badge className="rounded-full" style={{ backgroundColor: THEME.panel3, color: THEME.muted }}>{file.type}</Badge>
                    </div>
                  )) : <div className="text-sm" style={{ color: THEME.muted }}>No uploads yet.</div>}
                </div>
              </DarkPanel>

              <DarkPanel className="p-5">
                <div className="text-lg font-semibold">Quick tracking</div>
                <div className="mt-1 text-sm" style={{ color: THEME.muted }}>Resolve a child or parent ASIN into a tracked family.</div>
                <div className="mt-4 grid gap-4">
                  <div>
                    <Label className="mb-2 block">Team</Label>
                    <Select value={team} onValueChange={setTeam}>
                      <SelectTrigger className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAMS.map((item) => <SelectItem key={item.code} value={item.code}>{item.code} — {item.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Cadence</Label>
                    <Select value={cadence} onValueChange={setCadence}>
                      <SelectTrigger className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Child or parent ASIN</Label>
                    <div className="flex gap-2">
                      <Input value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter 10-character ASIN" className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                      <Button onClick={addTrackedParent} style={{ backgroundColor: THEME.accent, color: "#111" }}>
                        <Plus className="mr-2 h-4 w-4" /> Track
                      </Button>
                    </div>
                  </div>
                </div>
              </DarkPanel>
            </div>
          </motion.div>
        ) : null}

        {activeTab === "data" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold">Parent Tracking Data</h2>
                <p className="mt-2 text-sm" style={{ color: THEME.muted }}>Track actual parent families, not hardcoded placeholders. Select a parent to inspect processed children and keywords.</p>
              </div>
              <Button onClick={runTrackingAnalysis} disabled={!currentRecord || loading} style={{ backgroundColor: THEME.accent, color: "#111" }}>
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh tracking
              </Button>
            </div>
            <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
              <DarkPanel className="p-4">
                <div className="mb-3 text-lg font-semibold">Tracked parents</div>
                <div className="space-y-3">
                  {(trackedParents.length ? trackedParents : parentList.slice(0, 8).map((item) => ({ parentAsin: item.parentAsin, title: item.title, trackedChildren: item.variationCount, trackedKeywords: item.keywordCount, cadence, team: item.team }))).map((item, idx) => (
                    <button
                      key={`${item.parentAsin}-${idx}`}
                      onClick={() => setSelectedParent(item.parentAsin)}
                      className="w-full rounded-2xl border p-4 text-left transition"
                      style={{
                        borderColor: selectedParent === item.parentAsin ? THEME.accent : THEME.border,
                        backgroundColor: selectedParent === item.parentAsin ? "rgba(255,177,0,0.05)" : THEME.panel2,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{item.parentAsin}</div>
                          <div className="mt-1 text-sm" style={{ color: THEME.muted }}>{item.title}</div>
                        </div>
                        <Badge className="rounded-full" style={{ backgroundColor: THEME.panel3, color: THEME.muted }}>{item.cadence || cadence}</Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: THEME.muted }}>
                        <span>{item.trackedChildren || 0} children</span>
                        <span>{item.trackedKeywords || 0} keywords</span>
                        <span>Team {item.team || team}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </DarkPanel>

              <DarkPanel className="p-4">
                {currentRecord ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em]" style={{ color: THEME.muted }}>Selected parent</div>
                        <div className="mt-1 text-2xl font-semibold">{currentRecord.parentAsin}</div>
                        <div className="mt-1 text-sm" style={{ color: THEME.muted }}>{currentRecord.title}</div>
                      </div>
                      <Badge className="rounded-full" style={{ backgroundColor: THEME.panel3, color: THEME.accent2 }}>{currentRecord.trackedCoverage}% coverage</Badge>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <StatCard label="Children" value={currentRecord.variationCount} icon={Boxes} />
                      <StatCard label="Avg rank" value={currentRecord.averageRank ?? "—"} icon={BarChart3} />
                      <StatCard label="Keywords" value={currentRecord.keywordCount} icon={Target} />
                      <StatCard label="Best rank" value={currentRecord.bestRank ?? "—"} icon={TrendingUp} />
                    </div>
                    <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: THEME.border }}>
                      <Table>
                        <TableHeader>
                          <TableRow style={{ borderColor: THEME.border }}>
                            <TableHead>Child ASIN</TableHead>
                            <TableHead>Style</TableHead>
                            <TableHead>Avg rank</TableHead>
                            <TableHead>Keywords</TableHead>
                            <TableHead>Sponsored</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRecord.children.map((child) => (
                            <TableRow key={child.asin} style={{ borderColor: THEME.border }}>
                              <TableCell className="font-medium">{child.asin}</TableCell>
                              <TableCell>{child.style}</TableCell>
                              <TableCell>{child.averageRank ?? "—"}</TableCell>
                              <TableCell>{child.keywordCount}</TableCell>
                              <TableCell>{child.sponsoredKeywordCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center text-sm" style={{ color: THEME.muted }}>
                    Select a parent to inspect its child tracking and rank coverage.
                  </div>
                )}
              </DarkPanel>
            </div>
          </motion.div>
        ) : null}

        {activeTab === "keywords" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Keyword Intelligence</h2>
              <p className="mt-2 text-sm" style={{ color: THEME.muted }}>Keywords are processed at the parent level using uploaded rows, child coverage, average rank, and sponsored pressure.</p>
            </div>
            <DarkPanel className="p-4">
              {currentRecord ? (
                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: THEME.border }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: THEME.border }}>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Avg rank</TableHead>
                        <TableHead>Child coverage</TableHead>
                        <TableHead>Pressure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRecord.keywords.slice(0, 24).map((item) => (
                        <TableRow key={item.keyword} style={{ borderColor: THEME.border }}>
                          <TableCell className="font-medium">{item.keyword}</TableCell>
                          <TableCell>{item.score}</TableCell>
                          <TableCell>
                            <Badge className="rounded-full" style={{ backgroundColor: item.priority === "high" ? "rgba(255,177,0,0.12)" : THEME.panel3, color: item.priority === "high" ? THEME.accent : THEME.muted }}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.avgRank ?? "—"}</TableCell>
                          <TableCell>{item.childCoverage}</TableCell>
                          <TableCell>{item.sponsoredPressure ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : <div className="text-sm" style={{ color: THEME.muted }}>Select a parent ASIN to see processed keyword clusters.</div>}
            </DarkPanel>
          </motion.div>
        ) : null}

        {activeTab === "ppc" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold">PPC Strategy</h2>
                <p className="mt-2 text-sm" style={{ color: THEME.muted }}>Run tracking first, then turn processed keyword data into concrete PPC and listing actions.</p>
              </div>
              <Button onClick={runTrackingAnalysis} disabled={!currentRecord || loading} style={{ backgroundColor: THEME.accent, color: "#111" }}>
                <LineChart className="mr-2 h-4 w-4" /> Build strategy
              </Button>
            </div>
            {plan ? (
              <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                <DarkPanel className="p-5">
                  <div className="text-lg font-semibold">Summary</div>
                  <p className="mt-3 text-sm leading-6" style={{ color: THEME.muted }}>{plan.summary}</p>
                  <div className="mt-5 space-y-3">
                    {plan.keywordPushes.map((item) => (
                      <div key={item.keyword} className="rounded-2xl border p-4" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{item.keyword}</div>
                          <Badge className="rounded-full" style={{ backgroundColor: THEME.panel3, color: item.priority === "high" ? THEME.accent : THEME.muted }}>{item.priority}</Badge>
                        </div>
                        <div className="mt-2 text-sm" style={{ color: THEME.muted }}>{item.reason}</div>
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs" style={{ color: THEME.muted }}>
                            <span>Opportunity score</span>
                            <span>{item.score}/100</span>
                          </div>
                          <Progress value={item.score} />
                        </div>
                        <div className="mt-3 text-sm">{item.action}</div>
                      </div>
                    ))}
                  </div>
                </DarkPanel>
                <div className="space-y-4">
                  {[
                    ["Listing fixes", plan.listingFixes, FileUp],
                    ["PPC moves", plan.ppcMoves, BadgeDollarSign],
                    ["Risks", plan.risks, ShieldCheck],
                    ["Next actions", plan.nextActions, ChevronRight],
                  ].map(([title, items, Icon], idx) => (
                    <DarkPanel key={idx} className="p-4">
                      <div className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4" style={{ color: THEME.accent }} /> {title}</div>
                      <ul className="mt-3 space-y-2 text-sm" style={{ color: THEME.muted }}>
                        {(items || []).map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </DarkPanel>
                  ))}
                </div>
              </div>
            ) : (
              <DarkPanel className="p-6 text-sm" style={{ color: THEME.muted }}>
                Select a tracked parent and run the analysis engine to build a strategy.
              </DarkPanel>
            )}
          </motion.div>
        ) : null}

        {activeTab === "roadmap" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-3xl font-semibold">Roadmap</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Tracking engine", ["Persist snapshots per parent ASIN.", "Compare hourly vs daily rank deltas.", "Show movement by child and keyword."]],
                ["External sources", ["Add Jungle Scout connector route.", "Add Helium 10 connector route.", "Merge external keyword sources with uploaded data."]],
                ["Agent depth", ["Store conversation memory per parent.", "Answer from tracking history, keywords, and docs.", "Support listing rewrite tasks and PPC planning prompts."]],
              ].map(([title, items]) => (
                <DarkPanel key={title} className="p-5">
                  <div className="text-lg font-semibold">{title}</div>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: THEME.muted }}>
                    {items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </DarkPanel>
              ))}
            </div>
          </motion.div>
        ) : null}

        {activeTab === "apis" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-3xl font-semibold">API Integrations</h2>
            <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
              <DarkPanel className="p-5">
                <div className="text-lg font-semibold">Runtime + model</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Backend URL</Label>
                    <Input value={settings.backendUrl} onChange={(e) => setSettings((prev) => ({ ...prev, backendUrl: e.target.value }))} placeholder="https://your-app.com" className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                  </div>
                  <div>
                    <Label className="mb-2 block">OpenAI model</Label>
                    <Input value={settings.openaiModel} onChange={(e) => setSettings((prev) => ({ ...prev, openaiModel: e.target.value }))} className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Reasoning effort</Label>
                    <Select value={settings.reasoningEffort} onValueChange={(value) => setSettings((prev) => ({ ...prev, reasoningEffort: value }))}>
                      <SelectTrigger className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">OpenAI API key</Label>
                    <Input type="password" value={settings.openaiApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))} placeholder="sk-..." className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["Use backend proxy", settings.useBackendProxy, "Safer production path for agent and integrations.", (checked) => setSettings((prev) => ({ ...prev, useBackendProxy: checked }))],
                    ["Enable live analysis", settings.liveResearchEnabled, "Allow model-backed answers beyond local heuristics.", (checked) => setSettings((prev) => ({ ...prev, liveResearchEnabled: checked }))],
                    ["Auto-resolve parent", settings.autoResolveParent, "Map child ASINs into parent families when possible.", (checked) => setSettings((prev) => ({ ...prev, autoResolveParent: checked }))],
                  ].map(([label, checked, desc, handler]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }}>
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm" style={{ color: THEME.muted }}>{desc}</div>
                      </div>
                      <Switch checked={checked} onCheckedChange={handler} />
                    </div>
                  ))}
                </div>
              </DarkPanel>

              <div className="space-y-5">
                <DarkPanel className="p-5">
                  <div className="text-lg font-semibold">Jungle Scout</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="mb-2 block">Base URL</Label>
                      <Input value={settings.jungleScoutBaseUrl} onChange={(e) => setSettings((prev) => ({ ...prev, jungleScoutBaseUrl: e.target.value }))} placeholder="https://..." className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                    </div>
                    <div>
                      <Label className="mb-2 block">API key</Label>
                      <Input type="password" value={settings.jungleScoutApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, jungleScoutApiKey: e.target.value }))} placeholder="Jungle Scout key" className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                    </div>
                    <div className="text-sm" style={{ color: THEME.muted }}>Planned backend route: <code>/api/integrations/junglescout/sync-parent</code></div>
                  </div>
                </DarkPanel>

                <DarkPanel className="p-5">
                  <div className="text-lg font-semibold">Helium 10</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="mb-2 block">Base URL</Label>
                      <Input value={settings.helium10BaseUrl} onChange={(e) => setSettings((prev) => ({ ...prev, helium10BaseUrl: e.target.value }))} placeholder="https://..." className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                    </div>
                    <div>
                      <Label className="mb-2 block">API key</Label>
                      <Input type="password" value={settings.helium10ApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, helium10ApiKey: e.target.value }))} placeholder="Helium 10 key" className="border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                    </div>
                    <div className="text-sm" style={{ color: THEME.muted }}>Planned backend route: <code>/api/integrations/helium10/sync-parent</code></div>
                  </div>
                </DarkPanel>
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === "agent" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold">Ask Agent</h2>
                <p className="mt-2 text-sm" style={{ color: THEME.muted }}>The agent answers using the selected parent ASIN, processed keywords, child tracking, and the latest strategy.</p>
              </div>
              {currentRecord ? <TopBarBadge tone="success">{currentRecord.parentAsin}</TopBarBadge> : <TopBarBadge>No parent selected</TopBarBadge>}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr,360px]">
              <DarkPanel className="p-4">
                <ScrollArea className="h-[520px] pr-2">
                  <div className="space-y-4">
                    {chatHistory.map((entry, idx) => (
                      <div key={idx} className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-sm", entry.role === "assistant" ? "mr-auto" : "ml-auto")} style={{ backgroundColor: entry.role === "assistant" ? THEME.panel2 : "rgba(255,177,0,0.12)", color: THEME.text, border: `1px solid ${THEME.border}` }}>
                        <div className="mb-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: THEME.muted }}>{entry.role}</div>
                        <div className="leading-6">{entry.content}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DarkPanel>
              <div className="space-y-4">
                <DarkPanel className="p-4">
                  <Label className="mb-2 block">Ask the agent</Label>
                  <Textarea value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder="Which child should get budget first and why?" className="min-h-[160px] border" style={{ borderColor: THEME.border, backgroundColor: THEME.panel2 }} />
                  <Button onClick={sendChat} className="mt-3 w-full" style={{ backgroundColor: THEME.accent, color: "#111" }}>
                    <Bot className="mr-2 h-4 w-4" /> Send
                  </Button>
                </DarkPanel>
                <DarkPanel className="p-4">
                  <div className="font-medium">Suggested prompts</div>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: THEME.muted }}>
                    <li>• Which child ASIN should carry spend first?</li>
                    <li>• What are the top keywords for this parent?</li>
                    <li>• Which competitor terms deserve conquest campaigns?</li>
                    <li>• Why is this parent not tracking properly?</li>
                  </ul>
                </DarkPanel>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
