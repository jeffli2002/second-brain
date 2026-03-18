"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Brain,
  FileText,
  CheckSquare,
  Search,
  Home,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
  Activity,
  Zap,
} from "lucide-react";

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njxjuvxosvwvluxefrzg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeGp1dnhvc3Z3dmx1eGVmcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjkyNTUsImV4cCI6MjA4NzQwNTI1NX0.FqfMyI3uSkiHVepWVccxFU4ie5RU00VVdrF-aOr9LjI";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
interface Memory {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "long-term" | "daily" | "evolution";
}

interface Document {
  id: string;
  title: string;
  path: string;
  type: string;
  date: string;
  size: number;
}

interface Task {
  id: string;
  name: string;
  schedule: string;
  status: "ok" | "error" | "running" | "idle" | "disabled";
  lastRun: string | null;
  lastDuration: string | null;
  nextRun: string | null;
  errorCount: number;
  tokenUsage: number;
  updatedAt?: string | null;
}

interface TokenTrendPoint {
  date: string;
  totalTokens: number;
  taskBreakdown: Record<string, number>;
}

interface TokenTrendRangePoint extends TokenTrendPoint {
  agentBreakdown: Record<string, number>;
}

function addDaysToDateKey(dateKey: string, delta: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().split('T')[0];
}

function buildContinuousTrend(
  points: TokenTrendRangePoint[],
  range: 7 | 14 | 30,
  endDate?: string
): TokenTrendRangePoint[] {
  if (!points.length) return [];

  const finalDate = endDate || points[points.length - 1]?.date;
  if (!finalDate) return [];

  const byDate = new Map(points.map((point) => [point.date, point]));
  const startDate = addDaysToDateKey(finalDate, -(range - 1));

  return Array.from({ length: range }, (_, index) => {
    const date = addDaysToDateKey(startDate, index);
    return (
      byDate.get(date) || {
        date,
        totalTokens: 0,
        taskBreakdown: {},
        agentBreakdown: {},
      }
    );
  });
}

// 认证检查组件
function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agentModels, setAgentModels] = useState<Record<string, string>>({});

  useEffect(() => {
    const auth = localStorage.getItem("secondbrain_auth");
    if (auth !== "true") {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// 动态获取 Agent 模型配置
useEffect(() => {
  fetch('/api/agent-models')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.agents) {
        setAgentModels(data.agents);
      }
    })
    .catch(err => console.error('Failed to fetch agent models:', err));
}, []);

// 模拟数据 - 实际应该从API获取
const mockMemories: Memory[] = [
  {
    id: "1",
    title: "2026-02-23 工作日志",
    content: "今天完成了第二大脑系统的初步架构设计...",
    date: "2026-02-23",
    type: "daily",
  },
  {
    id: "2",
    title: "2026-02-22 工作日志",
    content: "修复了日报格式问题，开始使用四大板块规范...",
    date: "2026-02-22",
    type: "daily",
  },
  {
    id: "3",
    title: "长期记忆：日报格式规范",
    content: "四大板块：今日完成、进行中、反思与改进、明日计划",
    date: "2026-02-16",
    type: "long-term",
  },
  {
    id: "4",
    title: "2026-02-22 进化报告",
    content: " EvoMap信号检测、候选方案分析...",
    date: "2026-02-22",
    type: "evolution",
  },
];

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "MEMORY.md",
    path: "/root/.openclaw/workspace/MEMORY.md",
    type: "memory",
    date: "2026-02-23",
    size: 13075,
  },
  {
    id: "2",
    title: "每日工作报告 20260222",
    path: "/root/.openclaw/workspace/memory/daily_report_20260222.md",
    type: "report",
    date: "2026-02-22",
    size: 1636,
  },
  {
    id: "3",
    title: "AI日报 20260217",
    path: "/root/.openclaw/workspace/memory/ai-daily-20260217-v4.md",
    type: "newsletter",
    date: "2026-02-17",
    size: 5038,
  },
  {
    id: "4",
    title: "一人公司架构设计",
    path: "/root/.openclaw/workspace/ai-one-person-company-agent-architecture.md",
    type: "plan",
    date: "2026-02-15",
    size: 12848,
  },
  {
    id: "5",
    title: "OpenClaw课程 Phase1-2",
    path: "/root/.openclaw/workspace/memory/openclaw-course-phase1-2.md",
    type: "course",
    date: "2026-02-17",
    size: 9337,
  },
];

const mockTasks: Task[] = [
  {
    id: "1",
    name: "ai-daily-newsletter",
    schedule: "7:30 每天",
    status: "ok",
    lastRun: "2026-02-23 07:30",
    lastDuration: "159s",
    nextRun: "2026-02-24 07:30",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "2",
    name: "daily-content-publish",
    schedule: "9:00 每天",
    status: "ok",
    lastRun: "2026-02-23 09:00",
    lastDuration: "44s",
    nextRun: "2026-02-24 09:00",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "3",
    name: "growth-seo-keywords",
    schedule: "10:00 每天",
    status: "ok",
    lastRun: "2026-02-23 10:00",
    lastDuration: "114s",
    nextRun: "2026-02-24 10:00",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "4",
    name: "ai-kol-daily-newsletter",
    schedule: "11:00 每天",
    status: "ok",
    lastRun: "2026-02-23 11:00",
    lastDuration: "122s",
    nextRun: "2026-02-24 11:00",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "5",
    name: "product-competitor-analysis",
    schedule: "14:00 每天",
    status: "ok",
    lastRun: "2026-02-23 14:00",
    lastDuration: "110s",
    nextRun: "2026-02-24 14:00",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "6",
    name: "chief-daily-report",
    schedule: "19:30 每天",
    status: "error",
    lastRun: "2026-02-22 19:30",
    lastDuration: "59s",
    nextRun: "2026-02-23 19:30",
    errorCount: 4,
    tokenUsage: 0,
  },
  {
    id: "7",
    name: "daily-skill-evolution",
    schedule: "22:00 每天",
    status: "ok",
    lastRun: "2026-02-22 22:00",
    lastDuration: "50s",
    nextRun: "2026-02-23 22:00",
    errorCount: 0,
    tokenUsage: 0,
  },
  {
    id: "8",
    name: "gateway-health-backup",
    schedule: "每5分钟",
    status: "error",
    lastRun: "2026-02-23 15:50",
    lastDuration: "29s",
    nextRun: "2026-02-23 15:55",
    errorCount: 23,
    tokenUsage: 0,
  },
];

// Agent 类型定义
interface Agent {
  id: string;
  name: string;
  description: string;
  status: "ok" | "error" | "running" | "idle" | "disabled";
  model: string;
  tasks: number;
  completedTasks: number;
  failedTasks: number;
  tokenUsage: number;
  lastRun: string;
}

// Agent 模拟数据 - 与 openclaw.json 配置一致
const agentDefinitions = [
  {
    id: "coding",
    name: "Coding Agent",
    description: "负责代码开发、重构、调试、技术架构与Skill进化",
    model: "GPT-5.4",
    taskIds: ["task-evolution"],
  },
  {
    id: "content",
    name: "Content Agent",
    description: "负责AI日报、内容发布、KOL追踪",
    model: "Kimi K2.5",
    taskIds: ["task-ai-daily", "task-content-publish", "task-kol"],
  },
  {
    id: "growth",
    name: "Growth Agent",
    description: "负责OpenClaw动态监控",
    model: "MiniMax M2.5",
    taskIds: ["task-seo"],
  },
  {
    id: "product",
    name: "Product Agent",
    description: "负责竞品分析和产品规划",
    model: "MiniMax M2.5",
    taskIds: ["task-product"],
  },
  {
    id: "finance",
    name: "Finance Agent",
    description: "负责财务分析、成本控制与投资回报追踪",
    model: "MiniMax M2.5",
    taskIds: ["task-finance"],
  },
  {
    id: "chief",
    name: "Chief Agent",
    description: "负责每晚 Chief Agent 工作总结报告与系统巡检",
    model: "MiniMax M2.5",
    taskIds: ["task-chief", "task-health"],
  },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatFullDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const safeText = (value: unknown) => (typeof value === "string" ? value : "");
const matchesQuery = (query: string, ...fields: unknown[]) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return fields.some((field) => safeText(field).toLowerCase().includes(normalizedQuery));
};

const normalizeTask = (row: any): Task => ({
  id: row.id,
  name: row.name,
  schedule: row.schedule,
  status: row.status || "idle",
  lastRun: row.last_run || null,
  lastDuration: row.last_duration || null,
  nextRun: row.next_run || null,
  errorCount: row.error_count || 0,
  tokenUsage: row.token_usage || 0,
  updatedAt: row.updated_at || null,
});

const agentColorMap: Record<string, string> = {
  total: "#facc15",
  content: "#60a5fa",
  growth: "#34d399",
  product: "#f97316",
  chief: "#a78bfa",
  evo: "#f472b6",
};

type TabType = "home" | "memories" | "documents" | "tasks" | "agents" | "team" | "office";

export default function SecondBrain() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [draftSearchQuery, setDraftSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Memory | Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // 真实数据状态
  const [memories, setMemories] = useState<Memory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tokenTrend, setTokenTrend] = useState<TokenTrendPoint[]>([]);
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(14);

  // 从Supabase获取数据
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [memRes, docRes, taskRes, trendRes] = await Promise.all([
          supabase.from("memories").select("*").order("date", { ascending: false }),
          supabase.from("documents").select("*").order("date", { ascending: false }),
          supabase.from("tasks").select("*"),
          fetch("/api/token-trend").then((res) => res.json()).catch(() => ({ trend: [] })),
        ]);

        if (memRes.data) setMemories(memRes.data as Memory[]);
        if (docRes.data) setDocuments(docRes.data as Document[]);
        if (taskRes.data) setTasks(taskRes.data.map(normalizeTask));
        if (trendRes?.trend) setTokenTrend(trendRes.trend as TokenTrendPoint[]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 获取今天的日期
  const getToday = () => new Date().toISOString().split('T')[0];
  
  // 获取本周第一天
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };
  
  // 获取本月第一天
  const getMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  // 过滤数据 - 按日期范围筛选 (空范围=显示全部)
  const filteredMemories = memories.filter(
    (m) =>
      (m.type === "long-term" ||
        !dateRange.start ||
        !dateRange.end ||
        (m.date >= dateRange.start && m.date <= dateRange.end)) &&
      matchesQuery(searchQuery, m.title, m.content)
  );

  const filteredDocuments = documents.filter(
    (d) =>
      (!dateRange.start || !dateRange.end || (d.date >= dateRange.start && d.date <= dateRange.end)) &&
      matchesQuery(searchQuery, d.title, d.path, d.type)
  );

  const filteredTasks = tasks.filter((t) => matchesQuery(searchQuery, t.name, t.schedule, t.status));

  const searchedMemories = memories.filter((m) => matchesQuery(searchQuery, m.title, m.content));
  const searchedDocuments = documents.filter((d) => matchesQuery(searchQuery, d.title, d.path, d.type));
  const searchedTasks = tasks.filter((t) => matchesQuery(searchQuery, t.name, t.schedule, t.status));

  // 统计
  const stats = {
    totalMemories: memories.length,
    totalDocuments: documents.length,
    activeTasks: tasks.filter((t) => t.status === "ok" || t.status === "running").length,
    errorTasks: tasks.filter((t) => t.status === "error").length,
  };

  const agentCards = agentDefinitions.map((agent) => {
    const agentTasks = tasks.filter((task) => agent.taskIds.includes(task.id));
    const lastRunTimestamps = agentTasks
      .map((task) => (task.lastRun ? new Date(task.lastRun).getTime() : 0))
      .filter((value) => value > 0);

    const status = agentTasks.some((task) => task.status === "running")
      ? "running"
      : agentTasks.some((task) => task.status === "error")
      ? "error"
      : agentTasks.some((task) => task.status === "ok")
      ? "ok"
      : "idle";

    // 动态获取模型配置，优先使用 API 返回的值
    const modelFromApi = typeof agentModels === 'object' && agentModels !== null ? agentModels[agent.id] : undefined;
    const dynamicModel = modelFromApi || agent.model;

    return {
      ...agent,
      model: dynamicModel,
      status,
      tasks: agentTasks.length,
      completedTasks: agentTasks.filter((task) => task.status === "ok").length,
      failedTasks: agentTasks.filter((task) => task.status === "error").length,
      tokenUsage: agentTasks.reduce((sum, task) => sum + task.tokenUsage, 0),
      lastRun: lastRunTimestamps.length
        ? formatDateTime(new Date(Math.max(...lastRunTimestamps)).toISOString())
        : "—",
    };
  });

  const taskToAgent = Object.fromEntries(
    agentDefinitions.flatMap((agent) => agent.taskIds.map((taskId) => [taskId, agent.id]))
  ) as Record<string, string>;

  const trendData: TokenTrendRangePoint[] = tokenTrend.map((point) => {
    const agentBreakdown: Record<string, number> = {};
    Object.entries(point.taskBreakdown || {}).forEach(([taskId, value]) => {
      const agentId = taskToAgent[taskId] || "unknown";
      agentBreakdown[agentId] = (agentBreakdown[agentId] || 0) + value;
    });
    return { ...point, agentBreakdown };
  });

  const todayDate = new Date().toISOString().split('T')[0];
  const latestTrendDate = trendData[trendData.length - 1]?.date;
  const trendEndDate = latestTrendDate && latestTrendDate > todayDate ? latestTrendDate : todayDate;
  const displayTrend = buildContinuousTrend(trendData, trendRange, trendEndDate);
  const totalRangeTokens = displayTrend.reduce((sum, point) => sum + point.totalTokens, 0);
  const rangeTokenUsageByAgent = Object.fromEntries(
    agentDefinitions.map((agent) => [
      agent.id,
      displayTrend.reduce((sum, point) => sum + (point.agentBreakdown[agent.id] || 0), 0),
    ])
  ) as Record<string, number>;
  const tokenTrendMax = Math.max(...displayTrend.map((point) => point.totalTokens), 1);
  const lineSeries = [
    {
      key: "total",
      label: "总Token",
      color: agentColorMap.total,
      values: displayTrend.map((point) => point.totalTokens),
    },
    ...agentDefinitions.map((agent) => ({
      key: agent.id,
      label: agent.name,
      color: agentColorMap[agent.id] || "#94a3b8",
      values: displayTrend.map((point) => point.agentBreakdown[agent.id] || 0),
    })),
  ];

  const tokenDistribution = agentCards
    .map((agent) => ({
      id: agent.id,
      label: agent.name,
      value: rangeTokenUsageByAgent[agent.id] || 0,
      color: agentColorMap[agent.id] || "#94a3b8",
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const tokenDistributionMax = Math.max(...tokenDistribution.map((item) => item.value), 1);
  const latestSupabaseSyncAt = tasks.reduce<string | null>((latest, task) => {
    if (!task.updatedAt) return latest;
    if (!latest) return task.updatedAt;
    return new Date(task.updatedAt).getTime() > new Date(latest).getTime() ? task.updatedAt : latest;
  }, null);

  const handleSearchInputChange = (value: string) => {
    setDraftSearchQuery(value);
    if (!value.trim()) {
      setSearchQuery("");
    }
  };

  const commitSearch = () => {
    setSearchQuery(draftSearchQuery.trim());
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitSearch();
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "idle":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "disabled":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // 获取记忆类型图标
  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case "long-term":
        return <Brain className="w-4 h-4 text-purple-400" />;
      case "daily":
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case "evolution":
        return <Activity className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // 获取文档类型图标
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "memory":
        return <Brain className="w-4 h-4 text-purple-400" />;
      case "report":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "newsletter":
        return <BookOpen className="w-4 h-4 text-green-400" />;
      case "plan":
        return <FileText className="w-4 h-4 text-orange-400" />;
      case "course":
        return <BookOpen className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 渲染侧边栏
  const renderSidebar = () => (
    <aside className="w-64 bg-[#141416] border-r border-[#27272a] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#27272a]">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          第二大脑
        </h1>
        <p className="text-xs text-[#a1a1aa] mt-1">知识管理 · 记忆提取 · 任务追踪</p>
      </div>

      {/* 日期筛选 */}
      <div className="p-4 border-b border-[#27272a]">
        <label className="text-xs text-[#a1a1aa] block mb-2">日期范围</label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              max={dateRange.end}
              className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-2 text-white text-xs"
            />
            <span className="text-[#71717a] self-center">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              min={dateRange.start}
              max={getToday()}
              className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-2 text-white text-xs"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setDateRange({start: getToday(), end: getToday()})}
              className="flex-1 bg-blue-500/20 text-blue-400 px-2 py-1.5 rounded text-xs hover:bg-blue-500/30"
            >
              今天
            </button>
            <button
              onClick={() => setDateRange({start: getWeekStart(), end: getToday()})}
              className="flex-1 bg-purple-500/20 text-purple-400 px-2 py-1.5 rounded text-xs hover:bg-purple-500/30"
            >
              本周
            </button>
            <button
              onClick={() => setDateRange({start: getMonthStart(), end: getToday()})}
              className="flex-1 bg-green-500/20 text-green-400 px-2 py-1.5 rounded text-xs hover:bg-green-500/30"
            >
              本月
            </button>
            <button
              onClick={() => setDateRange({start: "", end: ""})}
              className="flex-1 bg-[#27272a] text-[#71717a] px-2 py-1.5 rounded text-xs hover:bg-[#3f3f46]"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "home"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>仪表盘</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("memories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "memories"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <Brain className="w-5 h-5" />
              <span>记忆库</span>
              <span className="ml-auto bg-[#27272a] px-2 py-0.5 rounded text-xs">
                {stats.totalMemories}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("documents")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "documents"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>文档库</span>
              <span className="ml-auto bg-[#27272a] px-2 py-0.5 rounded text-xs">
                {stats.totalDocuments}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "tasks"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>任务中心</span>
              {stats.errorTasks > 0 && (
                <span className="ml-auto bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">
                  {stats.errorTasks}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("agents")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "agents"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Agent中心</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "team"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Team</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("office")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "office"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v.01" />
                <path d="M9 12v.01" />
                <path d="M9 15v.01" />
                <path d="M9 18v.01" />
              </svg>
              <span>Office</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* 底部状态 */}
      <div className="p-4 border-t border-[#27272a]">
        <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>系统正常运行</span>
        </div>
      </div>
    </aside>
  );

  // Agent 状态类型（真实来源：OpenClaw cron）
  type AgentStatus = 'running' | 'ok' | 'error' | 'idle' | 'loading' | 'external';

  interface TeamAgent {
    id: string;
    name: string;
    role: string;
    icon: string;
    status: AgentStatus;
    lastActive: string;
    currentTask: string;
    taskProgress: number;
    totalTasks: number;
    okTasks: number;
    errorTasks: number;
    runningTasks: number;
    isExternal?: boolean;
  }

  interface TeamAgentDefinition {
    id: string;
    name: string;
    role: string;
    icon: string;
    isExternal?: boolean;
  }

  interface AgentStatusApiAgent {
    id: string;
    status: 'running' | 'ok' | 'error' | 'idle';
    tasks: number;
    completedTasks: number;
    failedTasks: number;
    runningTasks: number;
    idleTasks: number;
    lastRun: string | null;
  }

  interface OfficeActivity {
    id: string;
    agentId: string;
    agentName: string;
    agentIcon: string;
    status: AgentStatus;
    message: string;
    timestamp: string;
  }

  const TEAM_AGENT_DEFINITIONS: TeamAgentDefinition[] = [
    { id: 'chief', name: 'Chief Agent', role: '主 Agent', icon: '👑' },
    { id: 'content', name: 'Content Agent', role: '内容创作', icon: '📝' },
    { id: 'growth', name: 'Growth Agent', role: '增长营销', icon: '📈' },
    { id: 'coding', name: 'Coding Agent', role: '技术开发', icon: '💻' },
    { id: 'product', name: 'Product Agent', role: '产品经理', icon: '🎯' },
    { id: 'finance', name: 'Finance Agent', role: '财务管理', icon: '💰' },
    { id: 'abby', name: '阿比', role: '个人生活助理', icon: '🤖', isExternal: true },
  ];

  function formatRelativeTime(value?: string | null) {
    if (!value) return '从未运行';

    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return '时间未知';

    const diffMs = Date.now() - timestamp;
    if (diffMs < 60 * 1000) return '刚刚';

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  }

  function buildCurrentTaskSummary(agent?: AgentStatusApiAgent) {
    if (!agent || agent.tasks === 0) return '暂无绑定 cron 任务';
    if (agent.status === 'running') return `${agent.runningTasks} 个 cron 正在运行`;
    if (agent.status === 'error') return `${agent.failedTasks} 个 cron 异常`;
    if (agent.status === 'ok') return `${agent.completedTasks}/${agent.tasks} 个 cron 正常`;
    return `${agent.idleTasks || 0} 个 cron 等待执行`;
  }

  function buildOfficeActivityMessage(agent: TeamAgent) {
    if (agent.isExternal) {
      return '外部通道在线，负责个人生活与外部协作事项';
    }

    if (agent.status === 'running') {
      return `正在执行：${agent.currentTask}`;
    }

    if (agent.status === 'error') {
      return `需要处理：${agent.currentTask}`;
    }

    if (agent.status === 'ok') {
      return `执行正常：${agent.currentTask}`;
    }

    if (agent.status === 'idle') {
      return `待命中：${agent.currentTask}`;
    }

    return agent.currentTask;
  }

  function createOfficeActivity(agent: TeamAgent): OfficeActivity {
    return {
      id: `${agent.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentId: agent.id,
      agentName: agent.name,
      agentIcon: agent.icon,
      status: agent.status,
      message: buildOfficeActivityMessage(agent),
      timestamp: new Date().toISOString(),
    };
  }

  function createInitialTeamAgents(): TeamAgent[] {
    return TEAM_AGENT_DEFINITIONS.map((agent) => {
      if (agent.isExternal) {
        return {
          ...agent,
          status: 'external' as AgentStatus,
          lastActive: '外部系统',
          currentTask: '不受 OpenClaw cron 管理',
          taskProgress: 0,
          totalTasks: 0,
          okTasks: 0,
          errorTasks: 0,
          runningTasks: 0,
        };
      }

      return {
        ...agent,
        status: 'loading' as AgentStatus,
        lastActive: '同步中',
        currentTask: '正在读取 OpenClaw 实时状态',
        taskProgress: 0,
        totalTasks: 0,
        okTasks: 0,
        errorTasks: 0,
        runningTasks: 0,
      };
    });
  }

  const [teamAgents, setTeamAgents] = useState<TeamAgent[]>(createInitialTeamAgents);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [selectedOfficeAgentId, setSelectedOfficeAgentId] = useState('chief');
  const [officeActivities, setOfficeActivities] = useState<OfficeActivity[]>([]);
  const officeActivitySnapshotRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;

    const refreshAgentStatus = async () => {
      try {
        const response = await fetch('/api/agent-status', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`status api failed: ${response.status}`);
        }

        const data = await response.json();
        const apiAgents = ((data.agents || []) as AgentStatusApiAgent[]);
        const agentsById = new Map<string, AgentStatusApiAgent>(apiAgents.map((agent) => [agent.id, agent]));
        
        // 获取活跃的 subagent 会话
        const activeSessions = data.activeSessions || [];
        const activeAgentIds = new Set(activeSessions.map((s: any) => s.agentId));

        if (cancelled) return;

        setTeamAgents(
          TEAM_AGENT_DEFINITIONS.map((agent) => {
            if (agent.isExternal) {
              return {
                ...agent,
                status: 'external' as AgentStatus,
                lastActive: '外部系统',
                currentTask: '不受 OpenClaw cron 管理',
                taskProgress: 0,
                totalTasks: 0,
                okTasks: 0,
                errorTasks: 0,
                runningTasks: 0,
              };
            }

            const realAgent = agentsById.get(agent.id);
            const totalTasks = realAgent?.tasks || 0;
            const okTasks = realAgent?.completedTasks || 0;
            const errorTasks = realAgent?.failedTasks || 0;
            const runningTasks = realAgent?.runningTasks || 0;
            
            // 如果有活跃的 subagent 会话，状态为 running
            const isSubAgentRunning = activeAgentIds.has(agent.id);
            const status = isSubAgentRunning ? 'running' : (realAgent?.status || 'idle');

            return {
              ...agent,
              status: status as AgentStatus,
              lastActive: formatRelativeTime(realAgent?.lastRun),
              currentTask: isSubAgentRunning 
                ? `活跃会话: ${activeSessions.find((s: any) => s.agentId === agent.id)?.key?.split(':').pop() || '工作中'}`
                : buildCurrentTaskSummary(realAgent),
              taskProgress: totalTasks > 0 ? Math.round((okTasks / totalTasks) * 100) : 0,
              totalTasks,
              okTasks,
              errorTasks,
              runningTasks: isSubAgentRunning ? runningTasks + 1 : runningTasks,
            };
          })
        );
      } catch (error) {
        console.error('Failed to refresh agent status:', error);
        if (cancelled) return;

        setTeamAgents(
          TEAM_AGENT_DEFINITIONS.map((agent) => {
            if (agent.isExternal) {
              return {
                ...agent,
                status: 'external' as AgentStatus,
                lastActive: '外部系统',
                currentTask: '不受 OpenClaw cron 管理',
                taskProgress: 0,
                totalTasks: 0,
                okTasks: 0,
                errorTasks: 0,
                runningTasks: 0,
              };
            }

            return {
              ...agent,
              status: 'loading' as AgentStatus,
              lastActive: '状态获取失败',
              currentTask: '无法连接 /api/agent-status',
              taskProgress: 0,
              totalTasks: 0,
              okTasks: 0,
              errorTasks: 0,
              runningTasks: 0,
            };
          })
        );
      } finally {
        if (!cancelled) {
          setIsLoadingAgents(false);
        }
      }
    };

    refreshAgentStatus();
    const intervalId = window.setInterval(refreshAgentStatus, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isLoadingAgents || teamAgents.length === 0) {
      return;
    }

    const nextSnapshot = new Map<string, string>();
    const changedActivities: OfficeActivity[] = [];

    teamAgents.forEach((agent) => {
      const signature = [
        agent.status,
        agent.currentTask,
        agent.runningTasks,
        agent.errorTasks,
        agent.okTasks,
        agent.totalTasks,
      ].join('|');

      nextSnapshot.set(agent.id, signature);

      const previousSignature = officeActivitySnapshotRef.current.get(agent.id);
      if (previousSignature && previousSignature !== signature) {
        changedActivities.push(createOfficeActivity(agent));
      }
    });

    officeActivitySnapshotRef.current = nextSnapshot;

    setOfficeActivities((previous) => {
      if (previous.length === 0) {
        return [...teamAgents]
          .sort((a, b) => {
            const priority = { running: 0, error: 1, ok: 2, idle: 3, loading: 4, external: 5 } as const;
            return priority[a.status] - priority[b.status];
          })
          .map((agent) => createOfficeActivity(agent))
          .slice(0, 12);
      }

      if (changedActivities.length === 0) {
        return previous;
      }

      return [...changedActivities.reverse(), ...previous].slice(0, 18);
    });
  }, [teamAgents, isLoadingAgents]);

  // 状态映射
  const statusMap: Record<AgentStatus, { label: string; color: string; bgColor: string; icon: string }> = {
    running: { label: 'working', color: 'text-green-300', bgColor: 'bg-green-500', icon: '🟢' },
    ok: { label: 'ready', color: 'text-emerald-300', bgColor: 'bg-emerald-500', icon: '🟢' },
    error: { label: 'error', color: 'text-red-400', bgColor: 'bg-red-500', icon: '🔴' },
    idle: { label: 'idle', color: 'text-yellow-300', bgColor: 'bg-yellow-500', icon: '🟡' },
    loading: { label: '同步中', color: 'text-purple-400', bgColor: 'bg-purple-500', icon: '🟣' },
    external: { label: 'external', color: 'text-slate-400', bgColor: 'bg-slate-500', icon: '⚪️' },
  };

  // 获取状态样式
  const getStatusStyle = (status: AgentStatus) => statusMap[status] || statusMap.loading;

  // 渲染 Agent 卡片
  const renderAgentCard = (agent: TeamAgent, size: 'large' | 'medium' | 'small' = 'medium') => {
    const statusStyle = getStatusStyle(agent.status);
    const cardWidth = size === 'large' ? 'w-72' : size === 'medium' ? 'w-56' : 'w-48';

    return (
      <div
        key={agent.id}
        className={`${cardWidth} bg-[#141416] rounded-xl border-2 ${
          agent.isExternal ? 'border-dashed border-[#3f3f46]' : 'border-[#27272a]'
        } hover:border-purple-500/50 transition-all cursor-pointer group relative`}
      >
        {/* 状态徽章 */}
        <div className={`absolute -top-2 -right-2 ${statusStyle.bgColor} rounded-full px-2 py-0.5 text-xs flex items-center gap-1`}>
          <span>{statusStyle.icon}</span>
          <span className="text-white text-xs">{statusStyle.label}</span>
        </div>

        <div className="p-4">
          {/* Agent 图标和名称 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{agent.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{agent.name}</h3>
              <p className="text-xs text-[#71717a]">{agent.role}</p>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-[#27272a] my-3"></div>

          {/* 状态信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#71717a]">状态</span>
              <span className={statusStyle.color}>{statusStyle.icon} {statusStyle.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717a]">最后活跃</span>
              <span className="text-[#a1a1aa]">{agent.lastActive}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#71717a] shrink-0">状态摘要</span>
              <span className="text-[#a1a1aa] truncate max-w-[120px] text-right">{agent.currentTask}</span>
            </div>
          </div>

          {/* 悬停显示任务详情 */}
          <div className="absolute left-full top-0 ml-2 w-64 bg-[#1a1a1c] rounded-xl border border-[#27272a] p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              {agent.isExternal ? '📋 外部 Agent' : '📋 OpenClaw 实时状态'}
            </h4>
            <div className="border-t border-[#27272a] my-2"></div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#71717a]">状态摘要</p>
                <p className="text-sm text-white">{agent.currentTask}</p>
              </div>

              {!agent.isExternal && agent.totalTasks > 0 && (
                <div>
                  <p className="text-xs text-[#71717a] mb-1">正常率</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${agent.taskProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#a1a1aa]">{agent.taskProgress}%</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-[#71717a]">运行中 cron</p>
                <p className="text-sm text-white">{agent.isExternal ? '不适用' : `${agent.runningTasks} 个`}</p>
              </div>

              <div className="border-t border-[#27272a] my-2"></div>

              <div>
                <p className="text-xs text-[#71717a] mb-1">📊 当前统计</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#27272a] rounded py-1">
                    <p className="text-lg font-bold text-white">{agent.totalTasks}</p>
                    <p className="text-[10px] text-[#71717a]">绑定 cron</p>
                  </div>
                  <div className="bg-[#27272a] rounded py-1">
                    <p className="text-lg font-bold text-white">{agent.okTasks}</p>
                    <p className="text-[10px] text-[#71717a]">正常</p>
                  </div>
                  <div className="bg-[#27272a] rounded py-1">
                    <p className="text-lg font-bold text-white">{agent.errorTasks}</p>
                    <p className="text-[10px] text-[#71717a]">异常</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 指向箭头 */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1c] border-l-0 border-b-0 border-[#27272a] rotate-45"></div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染 Team 页面
  const renderTeam = () => {
    return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Team 架构
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#71717a]">
          <span className={`w-2 h-2 rounded-full ${isLoadingAgents ? 'bg-purple-500' : 'bg-green-500'} ${isLoadingAgents ? '' : 'animate-pulse'}`}></span>
          <span>{isLoadingAgents ? '正在同步实时状态' : '10秒轮询更新'}</span>
        </div>
      </div>

      {/* 架构图 */}
      <div className="flex flex-col items-center gap-8">
        {/* Chief Agent */}
        <div className="flex flex-col items-center">
          {renderAgentCard(teamAgents.find(a => a.id === 'chief')!, 'large')}
        </div>

        {/* 连接线 */}
        <div className="flex items-center justify-center w-full max-w-4xl">
          <div className="h-8 w-px bg-gradient-to-b from-purple-500 to-transparent"></div>
        </div>

        {/* 第一层 Sub Agents */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
          {renderAgentCard(teamAgents.find(a => a.id === 'content')!, 'medium')}
          {renderAgentCard(teamAgents.find(a => a.id === 'growth')!, 'medium')}
          {renderAgentCard(teamAgents.find(a => a.id === 'coding')!, 'medium')}
        </div>

        {/* 连接线 */}
        <div className="flex items-center justify-center w-full max-w-4xl">
          <div className="h-8 w-px bg-gradient-to-b from-blue-500 to-transparent"></div>
        </div>

        {/* 第二层 Sub Agents */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
          {renderAgentCard(teamAgents.find(a => a.id === 'product')!, 'medium')}
          {renderAgentCard(teamAgents.find(a => a.id === 'finance')!, 'medium')}
        </div>

        {/* 外部 Agent - 并行显示 */}
        <div className="mt-8">
          <p className="text-center text-xs text-[#71717a] mb-2">并行关系（外部 Agent）</p>
          {renderAgentCard(teamAgents.find(a => a.id === 'abby')!, 'small')}
        </div>
      </div>

      {/* 外部 Agent 提示 */}
      <div className="mt-8 p-4 bg-[#141416] rounded-xl border border-[#27272a]">
        <div className="flex items-center gap-2 text-yellow-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="font-semibold">注意</span>
        </div>
        <p className="text-sm text-[#a1a1aa] mt-2">
          阿比（外部 Agent）不受 OpenClaw cron 管理，因此这里只显示 external 标记，不参与真实 cron 状态聚合。
        </p>
      </div>

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {Object.entries(statusMap).map(([status, style]) => (
          <div key={status} className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${style.bgColor}`}></span>
            <span className="text-[#a1a1aa]">{style.icon} {style.label}</span>
          </div>
        ))}
      </div>
    </div>
    );
  };

  // 渲染 Office 页面
  const renderOffice = () => {
    const workspaceAgentIds = ['chief', 'content', 'growth', 'coding', 'product', 'finance'] as const;

    const officeAgentThemes: Record<
      string,
      {
        surface: string;
        border: string;
        text: string;
        primary: string;
        secondary: string;
        accent: string;
        hair: string;
        skin: string;
        hairStyle: 'quiff' | 'bob' | 'parted' | 'spiky' | 'bun' | 'wave' | 'visor';
        accessory: 'tie' | 'pen' | 'chart' | 'laptop' | 'badge' | 'calculator' | 'headset';
      }
    > = {
      chief: {
        surface: 'bg-violet-500/10',
        border: 'border-violet-400/30',
        text: 'text-violet-200',
        primary: '#8b5cf6',
        secondary: '#c4b5fd',
        accent: '#fbbf24',
        hair: '#312e81',
        skin: '#f6c7a4',
        hairStyle: 'quiff',
        accessory: 'tie',
      },
      content: {
        surface: 'bg-sky-500/10',
        border: 'border-sky-400/30',
        text: 'text-sky-200',
        primary: '#38bdf8',
        secondary: '#7dd3fc',
        accent: '#fde68a',
        hair: '#1e3a8a',
        skin: '#f3c9ad',
        hairStyle: 'bob',
        accessory: 'pen',
      },
      growth: {
        surface: 'bg-emerald-500/10',
        border: 'border-emerald-400/30',
        text: 'text-emerald-200',
        primary: '#10b981',
        secondary: '#6ee7b7',
        accent: '#86efac',
        hair: '#14532d',
        skin: '#f2c19c',
        hairStyle: 'parted',
        accessory: 'chart',
      },
      coding: {
        surface: 'bg-cyan-500/10',
        border: 'border-cyan-400/30',
        text: 'text-cyan-200',
        primary: '#06b6d4',
        secondary: '#67e8f9',
        accent: '#93c5fd',
        hair: '#164e63',
        skin: '#efc4a1',
        hairStyle: 'spiky',
        accessory: 'laptop',
      },
      product: {
        surface: 'bg-amber-500/10',
        border: 'border-amber-400/30',
        text: 'text-amber-200',
        primary: '#f59e0b',
        secondary: '#fcd34d',
        accent: '#fb7185',
        hair: '#7c2d12',
        skin: '#f4c6a7',
        hairStyle: 'bun',
        accessory: 'badge',
      },
      finance: {
        surface: 'bg-lime-500/10',
        border: 'border-lime-400/30',
        text: 'text-lime-200',
        primary: '#84cc16',
        secondary: '#bef264',
        accent: '#facc15',
        hair: '#365314',
        skin: '#f1c8a8',
        hairStyle: 'wave',
        accessory: 'calculator',
      },
      abby: {
        surface: 'bg-rose-500/10',
        border: 'border-rose-400/30',
        text: 'text-rose-200',
        primary: '#f43f5e',
        secondary: '#fda4af',
        accent: '#f9a8d4',
        hair: '#881337',
        skin: '#f3c7b4',
        hairStyle: 'visor',
        accessory: 'headset',
      },
    };

    type OfficePose = 'seated' | 'standing' | 'walking' | 'reception' | 'lounging';

    interface OfficePlacement {
      zone: string;
      left: string;
      top: string;
      pose: OfficePose;
      onDesk?: boolean;
      animationClass?: string;
    }

    interface DeskSlot {
      ownerId: (typeof workspaceAgentIds)[number];
      label: string;
      left: string;
      top: string;
    }

    const deskSlots: DeskSlot[] = [
      { ownerId: 'chief', label: 'Desk 1', left: '61%', top: '42%' },
      { ownerId: 'content', label: 'Desk 2', left: '73%', top: '42%' },
      { ownerId: 'growth', label: 'Desk 3', left: '85%', top: '42%' },
      { ownerId: 'coding', label: 'Desk 4', left: '61%', top: '66%' },
      { ownerId: 'product', label: 'Desk 5', left: '73%', top: '66%' },
      { ownerId: 'finance', label: 'Desk 6', left: '85%', top: '66%' },
    ];

    const walkingSpots = [
      { zone: 'Central Aisle · Walk Loop', left: '44%', top: '44%' },
      { zone: 'Central Aisle · Walk Loop', left: '48%', top: '60%' },
      { zone: 'Meeting Corridor · Walk Loop', left: '55%', top: '24%' },
    ];

    const loungeSpots = [
      { zone: 'Break Area · Sofa Left', left: '14%', top: '56%' },
      { zone: 'Break Area · Sofa Right', left: '20%', top: '56%' },
      { zone: 'Break Area · Coffee Seat', left: '28%', top: '61%' },
      { zone: 'Reception Lounge', left: '30%', top: '80%' },
    ];

    const standingSpots = [
      { zone: 'Coffee Bar', left: '26%', top: '48%' },
      { zone: 'Printing Corner', left: '18%', top: '26%' },
      { zone: 'Meeting Entry', left: '39%', top: '28%' },
    ];

    const findOfficeAgent = (agentId: string) => teamAgents.find((agent) => agent.id === agentId);

    const shouldBeAtDesk = (agent?: TeamAgent) => {
      if (!agent || agent.isExternal) return false;
      return agent.status === 'running' || agent.status === 'error' || agent.status === 'loading';
    };

    const officePlacementMap = new Map<string, OfficePlacement>();

    deskSlots.forEach((slot) => {
      const agent = findOfficeAgent(slot.ownerId);
      if (shouldBeAtDesk(agent)) {
        officePlacementMap.set(slot.ownerId, {
          zone: `Open Workspace · ${slot.label}`,
          left: slot.left,
          top: slot.top,
          pose: 'seated',
          onDesk: true,
        });
      }
    });

    const awayInternalAgents = teamAgents.filter((agent) => !agent.isExternal && !officePlacementMap.has(agent.id));
    const idleAwayAgents = awayInternalAgents.filter((agent) => agent.status === 'idle');
    const walkingIdleIds = new Set(idleAwayAgents.slice(0, Math.ceil(idleAwayAgents.length / 2)).map((agent) => agent.id));

    let walkingIndex = 0;
    let loungeIndex = 0;
    let standingIndex = 0;

    awayInternalAgents.forEach((agent) => {
      if (walkingIdleIds.has(agent.id)) {
        const spot = walkingSpots[walkingIndex] || walkingSpots[walkingSpots.length - 1];
        walkingIndex += 1;
        officePlacementMap.set(agent.id, {
          zone: spot.zone,
          left: spot.left,
          top: spot.top,
          pose: 'walking',
          animationClass: 'animate-office-walk',
        });
        return;
      }

      if (agent.status === 'idle' || agent.status === 'ok') {
        const spot = loungeSpots[loungeIndex] || loungeSpots[loungeSpots.length - 1];
        loungeIndex += 1;
        officePlacementMap.set(agent.id, {
          zone: spot.zone,
          left: spot.left,
          top: spot.top,
          pose: 'lounging',
          animationClass: 'animate-office-rest',
        });
        return;
      }

      const spot = standingSpots[standingIndex] || standingSpots[standingSpots.length - 1];
      standingIndex += 1;
      officePlacementMap.set(agent.id, {
        zone: spot.zone,
        left: spot.left,
        top: spot.top,
        pose: 'standing',
      });
    });

    officePlacementMap.set('abby', {
      zone: 'Reception · Front Desk',
      left: '22%',
      top: '81%',
      pose: 'reception',
      animationClass: 'animate-office-rest',
    });

    const getOfficeIndicatorClasses = (status: AgentStatus) => {
      switch (status) {
        case 'running':
          return 'bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.75)]';
        case 'ok':
          return 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.55)]';
        case 'error':
          return 'bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.65)]';
        case 'idle':
          return 'bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.55)]';
        case 'external':
          return 'bg-slate-300 shadow-[0_0_12px_rgba(203,213,225,0.35)]';
        default:
          return 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.45)]';
      }
    };

    const renderAreaLabel = (title: string, subtitle: string, className: string) => (
      <div className={`absolute rounded-full border border-white/10 bg-[#0f1014]/88 px-3 py-1.5 backdrop-blur-sm ${className}`}>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#cbd5e1]">{title}</p>
        <p className="text-[11px] text-[#71717a] mt-0.5">{subtitle}</p>
      </div>
    );

    const renderHair = (hairStyle: (typeof officeAgentThemes)[string]['hairStyle'], hairColor: string) => {
      switch (hairStyle) {
        case 'quiff':
          return <path d="M19 30c1-12 10-20 21-20 9 0 16 4 20 12 2 4 2 8 0 14H17c0-2 1-4 2-6Z" fill={hairColor} />;
        case 'bob':
          return <path d="M18 30c3-11 12-18 23-18 9 0 18 4 21 14 1 4 1 8-1 13H17c-1-3-1-6 1-9Z" fill={hairColor} />;
        case 'parted':
          return <path d="M18 31c2-11 11-18 22-18 8 0 15 2 21 10l-7 3-5-5-5 4-7-2-6 7H18Z" fill={hairColor} />;
        case 'spiky':
          return <path d="M17 32 23 18l7 8 5-12 9 11 8-9 8 16H17Z" fill={hairColor} />;
        case 'bun':
          return (
            <>
              <circle cx="52" cy="12" r="6" fill={hairColor} />
              <path d="M18 31c2-10 11-18 22-18 8 0 15 4 20 12 2 3 2 6 1 11H18c-1-1-1-3 0-5Z" fill={hairColor} />
            </>
          );
        case 'wave':
          return <path d="M17 31c2-10 11-18 22-18 10 0 18 5 22 15-5-2-8-1-11 2-4-3-8-3-12 1-4-4-10-4-21 0Z" fill={hairColor} />;
        case 'visor':
          return (
            <>
              <path d="M17 31c1-9 9-17 21-18 10 0 18 4 22 14l-2 9H18c-1-1-1-3-1-5Z" fill={hairColor} />
              <rect x="22" y="22" width="36" height="8" rx="4" fill="#f9a8d4" opacity="0.9" />
            </>
          );
      }
    };

    const renderAccessory = (accessory: (typeof officeAgentThemes)[string]['accessory'], accent: string) => {
      switch (accessory) {
        case 'tie':
          return <path d="M38 46h4l2 6-4 7-4-7 2-6Z" fill={accent} />;
        case 'pen':
          return <rect x="47" y="50" width="3" height="14" rx="1.5" fill={accent} transform="rotate(16 47 50)" />;
        case 'chart':
          return <path d="M29 58h20v4H29Zm0-8h4v8h-4Zm7-5h4v13h-4Zm7 2h4v11h-4Z" fill={accent} opacity="0.95" />;
        case 'laptop':
          return (
            <>
              <rect x="28" y="54" width="20" height="7" rx="2" fill="#dbeafe" opacity="0.85" />
              <rect x="31" y="50" width="14" height="6" rx="1.5" fill={accent} opacity="0.65" />
            </>
          );
        case 'badge':
          return <circle cx="47" cy="55" r="4" fill={accent} />;
        case 'calculator':
          return (
            <>
              <rect x="28" y="48" width="11" height="16" rx="2" fill={accent} opacity="0.95" />
              <path d="M31 52h5M31 56h5M31 60h2M34 60h2" stroke="#1f2937" strokeWidth="1.4" strokeLinecap="round" />
            </>
          );
        case 'headset':
          return (
            <>
              <path d="M22 27c0-10 8-18 18-18s18 8 18 18" stroke={accent} strokeWidth="3" strokeLinecap="round" fill="none" />
              <rect x="18" y="28" width="4" height="8" rx="2" fill={accent} />
              <rect x="58" y="28" width="4" height="8" rx="2" fill={accent} />
            </>
          );
      }
    };

    const renderOfficeAgentSvg = (
      agent: TeamAgent | undefined,
      options?: { pose?: OfficePose; size?: 'sm' | 'md' | 'lg'; compactLabel?: boolean }
    ) => {
      const resolvedAgent = agent ?? findOfficeAgent('chief');
      const theme = officeAgentThemes[resolvedAgent?.id || 'chief'] || officeAgentThemes.chief;
      const status = resolvedAgent?.status || 'loading';
      const pose = options?.pose || 'standing';
      const size = options?.size || 'sm';
      const compactLabel = options?.compactLabel ?? false;
      const wrapperClass = size === 'lg' ? 'w-[110px]' : size === 'md' ? 'w-[82px]' : 'w-[66px]';
      const shadowClass = pose === 'walking' ? 'scale-90 opacity-70' : pose === 'lounging' ? 'scale-95 opacity-80' : '';

      const armStroke = theme.secondary;
      const legStroke = '#1f2937';
      const leftArm =
        pose === 'walking'
          ? 'M26 51 Q15 58 18 72'
          : pose === 'reception'
          ? 'M26 51 Q18 57 18 66'
          : pose === 'lounging'
          ? 'M27 53 Q18 58 17 66'
          : 'M26 51 Q17 58 18 69';
      const rightArm =
        pose === 'walking'
          ? 'M54 51 Q64 58 60 72'
          : pose === 'reception'
          ? 'M54 51 Q60 55 60 66'
          : pose === 'lounging'
          ? 'M54 53 Q63 56 65 63'
          : 'M54 51 Q63 58 62 69';
      const leftLeg =
        pose === 'walking'
          ? 'M34 72 Q28 84 24 98'
          : pose === 'lounging'
          ? 'M34 72 Q24 79 18 86'
          : pose === 'seated'
          ? 'M34 72 Q35 79 34 88'
          : 'M34 72 Q31 86 30 98';
      const rightLeg =
        pose === 'walking'
          ? 'M46 72 Q54 84 58 98'
          : pose === 'lounging'
          ? 'M46 72 Q56 79 66 81'
          : pose === 'seated'
          ? 'M46 72 Q46 79 48 88'
          : 'M46 72 Q49 86 50 98';
      const torsoTransform =
        pose === 'walking'
          ? 'rotate(-4 40 56)'
          : pose === 'lounging'
          ? 'rotate(-12 40 58)'
          : pose === 'reception'
          ? 'rotate(0 40 56)'
          : 'rotate(0 40 56)';

      return (
        <div className={`relative ${wrapperClass}`}>
          <div className={`absolute left-1/2 bottom-[8px] h-3 w-10 -translate-x-1/2 rounded-full bg-black/30 blur-sm ${shadowClass}`} />
          <svg viewBox="0 0 80 112" className="w-full h-auto overflow-visible">
            <path d={leftArm} fill="none" stroke={armStroke} strokeWidth="6" strokeLinecap="round" />
            <path d={rightArm} fill="none" stroke={armStroke} strokeWidth="6" strokeLinecap="round" />
            <path d={leftLeg} fill="none" stroke={legStroke} strokeWidth="7" strokeLinecap="round" />
            <path d={rightLeg} fill="none" stroke={legStroke} strokeWidth="7" strokeLinecap="round" />

            <g transform={torsoTransform}>
              <circle cx="40" cy="27" r="14" fill={theme.skin} />
              {renderHair(theme.hairStyle, theme.hair)}
              <circle cx="35" cy="28" r="1.4" fill="#1f2937" />
              <circle cx="45" cy="28" r="1.4" fill="#1f2937" />
              <path d="M35 34c3 2 7 2 10 0" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <rect x="24" y="42" width="32" height="33" rx="14" fill={theme.primary} />
              <path d="M24 56c10 6 22 6 32 0v10c0 5-4 9-9 9H33c-5 0-9-4-9-9V56Z" fill={theme.secondary} opacity="0.45" />
              {renderAccessory(theme.accessory, theme.accent)}
            </g>
          </svg>
          <div className={`absolute right-0 top-[2px] h-3 w-3 rounded-full border border-white/30 ${getOfficeIndicatorClasses(status)}`} />
          <div className={`absolute inset-x-0 bottom-0 rounded-full bg-black/45 px-1 py-0.5 text-center font-medium text-white/90 ${compactLabel ? 'text-[9px]' : 'text-[10px]'}`}>
            {resolvedAgent?.name?.split(' ')[0] || 'Agent'}
          </div>
        </div>
      );
    };

    const renderStorageSvg = () => (
      <svg viewBox="0 0 320 190" className="absolute left-[4%] top-[10%] h-[20%] w-[16%] overflow-visible">
        <rect x="22" y="46" width="160" height="20" rx="8" fill="#64748b" />
        <rect x="20" y="28" width="164" height="24" rx="10" fill="#e2e8f0" />
        <rect x="32" y="66" width="10" height="86" rx="4" fill="#94a3b8" />
        <rect x="164" y="66" width="10" height="86" rx="4" fill="#94a3b8" />
        <rect x="210" y="34" width="84" height="118" rx="16" fill="#1f2937" opacity="0.84" />
        <rect x="224" y="52" width="56" height="16" rx="8" fill="#334155" />
        <rect x="224" y="80" width="56" height="16" rx="8" fill="#475569" />
        <rect x="224" y="108" width="56" height="16" rx="8" fill="#0f172a" />
        <rect x="66" y="-2" width="42" height="26" rx="13" fill="#111827" opacity="0.9" />
        <rect x="116" y="4" width="46" height="20" rx="10" fill="#f59e0b" opacity="0.4" />
        <rect x="54" y="84" width="48" height="42" rx="10" fill="#0f172a" opacity="0.72" />
        <path d="M112 102h36" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      </svg>
    );

    const renderMeetingTableSvg = (variant: 'small' | 'large') => {
      const chairs =
        variant === 'large'
          ? [
              { x: 20, y: 72, r: -90 },
              { x: 58, y: 26, r: -32 },
              { x: 130, y: 12, r: 0 },
              { x: 202, y: 26, r: 32 },
              { x: 240, y: 72, r: 90 },
              { x: 130, y: 132, r: 180 },
            ]
          : [
              { x: 18, y: 54, r: -90 },
              { x: 72, y: 12, r: 0 },
              { x: 126, y: 54, r: 90 },
              { x: 72, y: 98, r: 180 },
            ];

      return (
        <svg
          viewBox={variant === 'large' ? '0 0 260 150' : '0 0 144 112'}
          className={`absolute overflow-visible ${
            variant === 'large' ? 'right-[6%] top-[9%] h-[24%] w-[22%]' : 'left-[34%] top-[10%] h-[18%] w-[13%]'
          }`}
        >
          <ellipse
            cx={variant === 'large' ? 130 : 72}
            cy={variant === 'large' ? 72 : 54}
            rx={variant === 'large' ? 72 : 42}
            ry={variant === 'large' ? 40 : 24}
            fill="#d8dee9"
          />
          <ellipse
            cx={variant === 'large' ? 130 : 72}
            cy={variant === 'large' ? 80 : 58}
            rx={variant === 'large' ? 72 : 42}
            ry={variant === 'large' ? 40 : 24}
            fill="#94a3b8"
            opacity="0.68"
          />
          {chairs.map((chair, index) => (
            <g key={`${variant}-chair-${index}`} transform={`translate(${chair.x} ${chair.y}) rotate(${chair.r})`}>
              <rect x="-12" y="-10" width="24" height="12" rx="6" fill="#475569" />
              <rect x="-9" y="2" width="18" height="10" rx="5" fill="#64748b" />
            </g>
          ))}
        </svg>
      );
    };

    const renderSofaSvg = () => (
      <svg viewBox="0 0 240 128" className="absolute left-[6%] top-[47%] h-[17%] w-[18%] overflow-visible">
        <rect x="22" y="38" width="196" height="42" rx="20" fill="#fecdd3" opacity="0.42" />
        <rect x="34" y="54" width="172" height="40" rx="18" fill="#f8fafc" opacity="0.22" />
        <rect x="18" y="48" width="24" height="42" rx="12" fill="#cbd5e1" opacity="0.4" />
        <rect x="198" y="48" width="24" height="42" rx="12" fill="#cbd5e1" opacity="0.4" />
        <rect x="42" y="34" width="48" height="22" rx="12" fill="#ffffff" opacity="0.28" />
        <rect x="96" y="34" width="48" height="22" rx="12" fill="#ffffff" opacity="0.22" />
        <rect x="150" y="34" width="48" height="22" rx="12" fill="#ffffff" opacity="0.28" />
        <rect x="52" y="90" width="12" height="18" rx="4" fill="#64748b" />
        <rect x="176" y="90" width="12" height="18" rx="4" fill="#64748b" />
      </svg>
    );

    const renderCoffeeTableSvg = () => (
      <svg viewBox="0 0 140 90" className="absolute left-[22%] top-[55%] h-[10%] w-[10%] overflow-visible">
        <ellipse cx="70" cy="34" rx="44" ry="18" fill="#fde68a" opacity="0.85" />
        <path d="M36 36v28M104 36v28" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );

    const renderLoungeChairSvg = () => (
      <svg viewBox="0 0 140 120" className="absolute left-[12%] top-[62%] h-[11%] w-[10%] overflow-visible">
        <path d="M36 46c0-16 12-28 28-28h24c12 0 24 10 26 22l4 30H36V46Z" fill="#93c5fd" opacity="0.34" />
        <path d="M38 70h74l-8 26H46L38 70Z" fill="#e2e8f0" opacity="0.18" />
        <path d="M48 94v16M98 94v16" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );

    const renderReceptionDeskSvg = () => (
      <svg viewBox="0 0 260 150" className="absolute left-[7%] bottom-[7%] h-[17%] w-[22%] overflow-visible">
        <path d="M24 60c0-18 14-32 32-32h128c24 0 42 18 42 42v34c0 12-10 22-22 22H46c-12 0-22-10-22-22V60Z" fill="#f8fafc" opacity="0.14" />
        <path d="M38 46h104c28 0 48 18 48 42v22H38V46Z" fill="#fda4af" opacity="0.45" />
        <rect x="54" y="58" width="42" height="10" rx="5" fill="#ffffff" opacity="0.32" />
        <circle cx="176" cy="72" r="10" fill="#fde68a" opacity="0.62" />
      </svg>
    );

    const renderWcSvg = () => (
      <svg viewBox="0 0 170 180" className="absolute right-[4.5%] bottom-[14%] h-[21%] w-[10%] overflow-visible">
        <rect x="28" y="18" width="82" height="58" rx="20" fill="#e2e8f0" opacity="0.18" />
        <ellipse cx="69" cy="44" rx="28" ry="15" fill="#0f172a" opacity="0.92" />
        <rect x="46" y="82" width="48" height="58" rx="18" fill="#cbd5e1" opacity="0.24" />
        <rect x="110" y="42" width="24" height="82" rx="10" fill="#94a3b8" opacity="0.2" />
      </svg>
    );

    const renderOfficeChairSvg = (color: string) => (
      <svg viewBox="0 0 120 128" className="h-full w-full overflow-visible">
        <path d="M34 18c0-8 6-14 14-14h24c8 0 14 6 14 14v22c0 8-6 14-14 14H60c-14 0-26-12-26-26V18Z" fill={color} opacity="0.88" />
        <path d="M46 56h28v12c0 8-6 14-14 14s-14-6-14-14V56Z" fill="#e2e8f0" opacity="0.3" />
        <rect x="55" y="78" width="10" height="18" rx="5" fill="#94a3b8" />
        <path d="M60 96 36 108M60 96 84 108M60 96 44 120M60 96 76 120" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="110" r="6" fill="#cbd5e1" />
        <circle cx="88" cy="110" r="6" fill="#cbd5e1" />
        <circle cx="42" cy="122" r="6" fill="#cbd5e1" />
        <circle cx="78" cy="122" r="6" fill="#cbd5e1" />
      </svg>
    );

    const renderDeskStation = (slot: DeskSlot) => {
      const owner = findOfficeAgent(slot.ownerId);
      const theme = officeAgentThemes[slot.ownerId] || officeAgentThemes.chief;
      const placement = officePlacementMap.get(slot.ownerId);
      const occupied = !!placement?.onDesk;
      const isSelected = selectedOfficeAgentId === slot.ownerId;

      return (
        <button
          key={slot.ownerId}
          type="button"
          onClick={() => setSelectedOfficeAgentId(slot.ownerId)}
          className={`absolute h-[18%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-[26px] transition-all hover:scale-[1.01] ${
            isSelected ? 'ring-2 ring-white/20' : ''
          }`}
          style={{ left: slot.left, top: slot.top }}
        >
          <div className={`relative h-full w-full rounded-[26px] border ${theme.border} ${theme.surface} overflow-hidden`}>
            <svg viewBox="0 0 220 170" className="absolute inset-0 h-full w-full overflow-visible">
              <path d="M34 32h152c8 0 14 6 14 14v8H20v-8c0-8 6-14 14-14Z" fill="#e2e8f0" />
              <path d="M20 54h180v18c0 7-6 13-13 13H33c-7 0-13-6-13-13V54Z" fill="#94a3b8" opacity="0.92" />
              <rect x="34" y="80" width="12" height="62" rx="6" fill="#64748b" />
              <rect x="174" y="80" width="12" height="62" rx="6" fill="#64748b" />
              <rect x="82" y="42" width="56" height="26" rx="6" fill="#0f172a" opacity="0.94" />
              <rect x="96" y="70" width="28" height="6" rx="3" fill="#cbd5e1" opacity="0.62" />
              <rect x="48" y="44" width="18" height="18" rx="5" fill={theme.accent} opacity="0.48" />
              <rect x="154" y="44" width="16" height="16" rx="5" fill="#ffffff" opacity="0.16" />
            </svg>

            <div className="absolute left-1/2 bottom-[4%] h-[46%] w-[36%] -translate-x-1/2">
              {renderOfficeChairSvg(theme.secondary)}
            </div>

            {occupied ? (
              <div className="absolute left-1/2 top-[18%] -translate-x-1/2">
                {renderOfficeAgentSvg(owner, { pose: 'seated', compactLabel: true })}
              </div>
            ) : (
              <div className={`absolute left-1/2 top-[54%] -translate-x-1/2 rounded-full border px-2 py-1 text-[9px] ${theme.border} bg-black/25 ${theme.text}`}>
                {owner?.status === 'idle' ? 'walking' : owner?.status === 'ok' ? 'break time' : 'away'}
              </div>
            )}

            <div className="absolute left-[8%] top-[8%] rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[#d4d4d8]">
              {slot.label}
            </div>
            <div className="absolute right-[8%] top-[8%] h-2.5 w-2.5 rounded-full border border-white/30">
              <div className={`h-full w-full rounded-full ${getOfficeIndicatorClasses(owner?.status || 'loading')}`} />
            </div>
          </div>
        </button>
      );
    };

    const selectedOfficeAgent = teamAgents.find((agent) => agent.id === selectedOfficeAgentId) ?? teamAgents[0];
    const selectedPlacement = officePlacementMap.get(selectedOfficeAgent?.id || 'chief');
    const selectedOfficeStatusStyle = selectedOfficeAgent ? getStatusStyle(selectedOfficeAgent.status) : statusMap.loading;
    const selectedTheme = officeAgentThemes[selectedOfficeAgent?.id || 'chief'] || officeAgentThemes.chief;
    const runningCount = teamAgents.filter((agent) => !agent.isExternal && agent.status === 'running').length;
    const errorCount = teamAgents.filter((agent) => !agent.isExternal && agent.status === 'error').length;
    const idleCount = teamAgents.filter((agent) => !agent.isExternal && agent.status === 'idle').length;
    const seatedCount = workspaceAgentIds.filter((agentId) => officePlacementMap.get(agentId)?.onDesk).length;
    const awayCount = teamAgents.filter((agent) => !officePlacementMap.get(agent.id)?.onDesk).length;
    const strollingCount = walkingIdleIds.size;
    const restingCount = awayInternalAgents.filter(
      (agent) => !walkingIdleIds.has(agent.id) && (agent.status === 'idle' || agent.status === 'ok')
    ).length;

    const presenceCards = teamAgents.map((agent) => ({
      agent,
      placement: officePlacementMap.get(agent.id),
    }));

    return (
      <div className="p-6 lg:p-8 pb-12 animate-fadeIn">
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v.01" />
                <path d="M9 12v.01" />
                <path d="M9 15v.01" />
                <path d="M9 18v.01" />
              </svg>
              Second Brain Office
            </h2>
            <p className="text-sm text-[#71717a] mt-2 max-w-4xl leading-6">
              整个办公室改成扁平 2D SVG 俯视图：真实桌子、椭圆会议桌、三人沙发、带轮办公椅全部换成 SVG；空闲 Agent 按一半走动、一半在休息区落座。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="px-3 py-2 rounded-xl border border-[#27272a] bg-[#141416] text-[#a1a1aa]">Flat Office Overview 全宽</div>
            <div className="px-3 py-2 rounded-xl border border-[#27272a] bg-[#141416] text-[#a1a1aa]">SVG furniture + SVG people</div>
            <div className="px-3 py-2 rounded-xl border border-green-500/20 bg-green-500/10 text-green-200">{strollingCount} 个 idle Agent 正在走动</div>
          </div>
        </div>

        <div className="space-y-6 w-full min-w-0">
          <div className="rounded-3xl border border-[#27272a] bg-[#101012] p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-white">Flat Office Overview</h3>
                <p className="text-xs text-[#71717a] mt-1 leading-5">
                  横向铺满内容区，不保留右侧留白。点击工位或人物可在下方查看详情；Office 视图本身保持 100% 宽度展示。
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#71717a]">
                <span className={`w-2 h-2 rounded-full ${isLoadingAgents ? 'bg-purple-500' : 'bg-green-500'} ${isLoadingAgents ? '' : 'animate-pulse'}`}></span>
                <span>{isLoadingAgents ? '同步中' : '10 秒轮询更新'}</span>
              </div>
            </div>

            <div className="relative aspect-[21/9] min-h-[520px] w-full overflow-hidden rounded-[28px] border border-[#1f1f22] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_24%),linear-gradient(180deg,#0b0b0d_0%,#111216_100%)]">
              <div className="absolute inset-[2.2%] rounded-[30px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
              <div className="absolute left-[37%] top-[14%] h-[60%] w-[18%] rounded-[56px] border border-dashed border-white/8 bg-white/[0.015]" />
              <div className="absolute left-[44%] top-[24%] h-[40%] w-[4.5%] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />

              {renderAreaLabel('PRINT / STORAGE', '打印与储物', 'left-[4%] top-[4.5%]')}
              {renderAreaLabel('MEETING B', '小型碰头', 'left-[33%] top-[4.5%]')}
              {renderAreaLabel('MEETING A', '评审 / 讨论', 'right-[7%] top-[4.5%]')}
              {renderAreaLabel('BREAK AREA', '沙发 / 咖啡', 'left-[6%] top-[38%]')}
              {renderAreaLabel('CENTRAL AISLE', 'idle Agent 会走动', 'left-[40%] bottom-[12%]')}
              {renderAreaLabel('OPEN WORKSPACE', '工作中的 Agent 在工位', 'left-[58%] top-[30%]')}
              {renderAreaLabel('RECEPTION', 'Abby 前台接待', 'left-[8%] bottom-[7%]')}
              {renderAreaLabel('WC', '洗手间', 'right-[4.5%] bottom-[12%]')}
              {renderAreaLabel('ENTRANCE', '访客入口', 'left-[3.5%] bottom-[14%]')}

              {renderStorageSvg()}
              {renderMeetingTableSvg('small')}
              {renderMeetingTableSvg('large')}
              {renderSofaSvg()}
              {renderCoffeeTableSvg()}
              {renderLoungeChairSvg()}
              {renderReceptionDeskSvg()}
              {renderWcSvg()}

              <div className="absolute left-[28%] top-[44%] text-[28px]">🪴</div>
              <div className="absolute left-[27%] top-[57%] text-[24px]">☕</div>
              <div className="absolute left-[7%] bottom-[9%] flex items-center gap-2 text-amber-200 text-sm">
                <span className="text-lg">➡️</span>
                <span>entrance</span>
              </div>

              {deskSlots.map((slot) => renderDeskStation(slot))}

              {presenceCards
                .filter(({ placement }) => placement && !placement.onDesk)
                .map(({ agent, placement }) => (
                  <button
                    key={`${agent.id}-presence`}
                    type="button"
                    onClick={() => setSelectedOfficeAgentId(agent.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-[1.03] ${
                      selectedOfficeAgentId === agent.id ? 'ring-2 ring-white/20 rounded-full' : ''
                    }`}
                    style={{ left: placement?.left, top: placement?.top }}
                  >
                    <div className={placement?.animationClass || ''}>
                      {renderOfficeAgentSvg(agent, {
                        pose: placement?.pose || 'standing',
                        size: agent.id === 'abby' ? 'md' : 'sm',
                      })}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
              <p className="text-xs text-[#71717a] mb-2">工位占用</p>
              <p className="text-2xl font-semibold text-white">{seatedCount}/6</p>
              <p className="text-xs text-[#a1a1aa] mt-2">running / error / loading 会留在桌前。</p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
              <p className="text-xs text-[#71717a] mb-2">Idle 走动</p>
              <p className="text-2xl font-semibold text-white">{strollingCount}</p>
              <p className="text-xs text-[#a1a1aa] mt-2">一半 idle Agent 被放到过道并加上步行动画。</p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
              <p className="text-xs text-[#71717a] mb-2">休息区落座</p>
              <p className="text-2xl font-semibold text-white">{restingCount}</p>
              <p className="text-xs text-[#a1a1aa] mt-2">剩余 idle / ok Agent 在沙发区和咖啡位坐着。</p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
              <p className="text-xs text-[#71717a] mb-2">异常处理</p>
              <p className="text-2xl font-semibold text-red-300">{errorCount}</p>
              <p className="text-xs text-[#a1a1aa] mt-2">红灯代表正在处理错误或异常任务。</p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#141416] p-4">
              <p className="text-xs text-[#71717a] mb-2">离开工位</p>
              <p className="text-2xl font-semibold text-white">{awayCount}</p>
              <p className="text-xs text-[#a1a1aa] mt-2">包含休息区、走动区和前台接待位。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
            <div className={`rounded-3xl border overflow-hidden ${selectedTheme.border} bg-[#141416] shadow-[0_24px_60px_rgba(0,0,0,0.32)]`}>
              <div className="p-5 border-b border-[#27272a]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#71717a]">Agent Snapshot</p>
                    <h3 className="text-lg font-semibold text-white mt-2">{selectedOfficeAgent?.name || 'Agent'}</h3>
                    <p className="text-xs text-[#a1a1aa] mt-1">{selectedPlacement?.zone || 'Office floor'}</p>
                  </div>
                  <div className="shrink-0">
                    {renderOfficeAgentSvg(selectedOfficeAgent, {
                      pose: selectedPlacement?.pose || 'standing',
                      size: 'lg',
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a] text-sm">实时状态</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${selectedOfficeStatusStyle.color} bg-black/20`}>
                    <span>{selectedOfficeStatusStyle.icon}</span>
                    <span>{selectedOfficeStatusStyle.label}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#71717a]">角色</span>
                  <span className="text-[#e4e4e7]">{selectedOfficeAgent?.role || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#71717a]">最后活跃</span>
                  <span className="text-[#e4e4e7]">{selectedOfficeAgent?.lastActive || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#71717a]">办公室位置</span>
                  <span className="text-[#e4e4e7] text-right max-w-[60%]">{selectedPlacement?.zone || 'Office floor'}</span>
                </div>
                <div className="rounded-2xl border border-[#27272a] bg-[#101012] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#71717a] mb-2">Current Task</p>
                  <p className="text-sm text-[#e4e4e7] leading-6">{selectedOfficeAgent?.currentTask || '暂无任务信息'}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-[#27272a] bg-[#101012] p-3">
                    <div className="text-lg font-semibold text-white">{selectedOfficeAgent?.totalTasks || 0}</div>
                    <div className="text-[11px] text-[#71717a] mt-1">任务数</div>
                  </div>
                  <div className="rounded-2xl border border-[#27272a] bg-[#101012] p-3">
                    <div className="text-lg font-semibold text-green-300">{selectedOfficeAgent?.runningTasks || 0}</div>
                    <div className="text-[11px] text-[#71717a] mt-1">运行中</div>
                  </div>
                  <div className="rounded-2xl border border-[#27272a] bg-[#101012] p-3">
                    <div className="text-lg font-semibold text-red-300">{selectedOfficeAgent?.errorTasks || 0}</div>
                    <div className="text-[11px] text-[#71717a] mt-1">异常</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#27272a] bg-[#141416] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              <div className="p-5 border-b border-[#27272a] flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Live Activities</h3>
                  <p className="text-xs text-[#71717a] mt-1">根据状态变化自动生成，保留最近 18 条。</p>
                </div>
                <div className="text-right text-xs text-[#71717a]">
                  <div>{isLoadingAgents ? '同步中' : 'Auto Refresh'}</div>
                  <div className="mt-1">10 sec</div>
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto divide-y divide-[#27272a]">
                {officeActivities.map((activity) => {
                  const activityStatusStyle = getStatusStyle(activity.status);
                  const activityTheme = officeAgentThemes[activity.agentId] || officeAgentThemes.chief;
                  return (
                    <div key={activity.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 shrink-0 rounded-2xl border flex items-center justify-center text-xl ${activityTheme.border} ${activityTheme.surface}`}>
                          {activity.agentIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white truncate">{activity.agentName}</p>
                            <span className={`text-[11px] ${activityStatusStyle.color}`}>{formatRelativeTime(activity.timestamp)}</span>
                          </div>
                          <p className="text-sm text-[#cbd5e1] leading-6 mt-1">{activity.message}</p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#71717a]">
                            <span>{activityStatusStyle.icon}</span>
                            <span>{activityStatusStyle.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {presenceCards.map(({ agent, placement }) => {
              const theme = officeAgentThemes[agent.id] || officeAgentThemes.chief;
              const statusStyle = getStatusStyle(agent.status);
              const isSelected = selectedOfficeAgentId === agent.id;
              return (
                <button
                  key={`presence-card-${agent.id}`}
                  type="button"
                  onClick={() => setSelectedOfficeAgentId(agent.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    isSelected ? `${theme.surface} ${theme.border} ring-2 ring-white/15` : 'border-[#27272a] bg-[#141416] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{agent.icon}</span>
                        <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                      </div>
                      <p className="text-[11px] text-[#71717a] mt-2 truncate">{placement?.zone || agent.role}</p>
                    </div>
                    <span className={`text-[11px] shrink-0 ${statusStyle.color}`}>{statusStyle.icon} {statusStyle.label}</span>
                  </div>
                  <p className="text-[11px] text-[#a1a1aa] mt-3 truncate">{agent.currentTask}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-[#27272a] bg-[#141416] p-5">
            <h3 className="text-base font-semibold text-white">Office Pulse</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-2xl border border-[#27272a] bg-[#101012] px-4 py-3 flex items-center justify-between"><span className="text-[#71717a]">Working at desks</span><span className="text-green-300">{runningCount}</span></div>
              <div className="rounded-2xl border border-[#27272a] bg-[#101012] px-4 py-3 flex items-center justify-between"><span className="text-[#71717a]">Idle / away</span><span className="text-yellow-300">{idleCount}</span></div>
              <div className="rounded-2xl border border-[#27272a] bg-[#101012] px-4 py-3 flex items-center justify-between"><span className="text-[#71717a]">Errors</span><span className="text-red-300">{errorCount}</span></div>
              <div className="rounded-2xl border border-[#27272a] bg-[#101012] px-4 py-3 flex items-center justify-between"><span className="text-[#71717a]">Break seats filled</span><span className="text-sky-300">{restingCount}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // 渲染首页
  const renderHome = () => (
    <div className="p-8 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6">仪表盘概览</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#141416] p-6 rounded-xl border border-[#27272a]">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-[#a1a1aa]">记忆总数</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalMemories}</p>
        </div>
        <div className="bg-[#141416] p-6 rounded-xl border border-[#27272a]">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-[#a1a1aa]">文档总数</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalDocuments}</p>
        </div>
        <div className="bg-[#141416] p-6 rounded-xl border border-[#27272a]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-[#a1a1aa]">运行中任务</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeTasks}</p>
        </div>
        <div className="bg-[#141416] p-6 rounded-xl border border-[#27272a]">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-[#a1a1aa]">异常任务</span>
          </div>
          <p className="text-3xl font-bold">{stats.errorTasks}</p>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近记忆 */}
        <div className="bg-[#141416] rounded-xl border border-[#27272a]">
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              最近记忆
            </h3>
            <button
              onClick={() => setActiveTab("memories")}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {memories.slice(0, 3).map((memory) => (
              <div
                key={memory.id}
                className="p-3 bg-[#1f1f22] rounded-lg hover:bg-[#27272a] cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedItem(memory);
                  setActiveTab("memories");
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getMemoryTypeIcon(memory.type)}
                  <span className="text-sm font-medium">{memory.title}</span>
                </div>
                <p className="text-xs text-[#a1a1aa] line-clamp-2">{memory.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 最近任务 */}
        <div className="bg-[#141416] rounded-xl border border-[#27272a]">
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              任务状态
            </h3>
            <button
              onClick={() => setActiveTab("tasks")}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 bg-[#1f1f22] rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium">{task.name}</span>
                </div>
                <span className="text-xs text-[#a1a1aa]">{task.schedule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染记忆库
  const renderMemories = () => (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" />
          记忆库
        </h2>
      </div>

      {/* 搜索 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="搜索记忆（按回车执行）..."
          value={draftSearchQuery}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 记忆列表 */}
      <div className="space-y-3">
        {filteredMemories.map((memory) => (
          <div
            key={memory.id}
            className="bg-[#141416] p-4 rounded-xl border border-[#27272a] hover:border-purple-500/50 cursor-pointer transition-colors"
            onClick={() => setSelectedItem(memory)}
          >
            <div className="flex items-center gap-3 mb-2">
              {getMemoryTypeIcon(memory.type)}
              <h3 className="font-semibold">{memory.title}</h3>
              <span className="text-xs text-[#a1a1aa] ml-auto">{memory.date}</span>
            </div>
            <p className="text-sm text-[#a1a1aa] line-clamp-2">{memory.content}</p>
          </div>
        ))}
      </div>

      {/* 详情模态框 - 记忆 */}
      {selectedItem && "content" in selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141416] rounded-xl border border-[#27272a] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {"type" in selectedItem && getMemoryTypeIcon(selectedItem.type)}
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#a1a1aa] hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* 元信息 */}
              <div className="flex gap-4 mb-4 text-sm">
                <span className="text-[#71717a]">
                  类型: {"type" in selectedItem && (
                    <span className="text-blue-400">{selectedItem.type === 'long-term' ? '长期记忆' : selectedItem.type === 'daily' ? '日记' : '进化'}</span>
                  )}
                </span>
                <span className="text-[#71717a]">
                  日期: <span className="text-white">{selectedItem.date}</span>
                </span>
              </div>
              {/* 详细内容 */}
              <div className="border-t border-[#27272a] pt-4">
                <pre className="text-[#d4d4d8] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedItem.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染文档库
  const renderDocuments = () => (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-400" />
          文档库
        </h2>
      </div>

      {/* 搜索 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="搜索文档（按回车执行）..."
          value={draftSearchQuery}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 文档列表 */}
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-[#141416] p-4 rounded-xl border border-[#27272a] hover:border-blue-500/50 cursor-pointer transition-colors"
            onClick={() => setSelectedItem(doc)}
          >
            <div className="flex items-center gap-3 mb-2">
              {getDocumentTypeIcon(doc.type)}
              <h3 className="font-semibold">{doc.title}</h3>
              <span className="text-xs bg-[#27272a] px-2 py-1 rounded text-[#a1a1aa]">
                {doc.type}
              </span>
              <span className="text-xs text-[#a1a1aa] ml-auto">{doc.date}</span>
            </div>
            <p className="text-xs text-[#a1a1aa] truncate">{doc.path}</p>
            <p className="text-xs text-[#a1a1aa] mt-1">{formatSize(doc.size)}</p>
          </div>
        ))}
      </div>

      {/* 详情模态框 - 文档 */}
      {selectedItem && "path" in selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141416] rounded-xl border border-[#27272a] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {"type" in selectedItem && getDocumentTypeIcon(selectedItem.type)}
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#a1a1aa] hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* 元信息 */}
              <div className="bg-[#0a0a0c] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#71717a] text-xs">文件路径</p>
                    <p className="text-[#d4d4d8] truncate mt-1">{selectedItem.path}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a] text-xs">文件类型</p>
                    <p className="text-blue-400 mt-1">{selectedItem.type}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a] text-xs">文件大小</p>
                    <p className="text-white mt-1">{formatSize(selectedItem.size)}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a] text-xs">创建日期</p>
                    <p className="text-white mt-1">{selectedItem.date}</p>
                  </div>
                </div>
              </div>
              {/* 提示 */}
              <p className="text-xs text-[#71717a] text-center">
                文件预览功能开发中...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTokenTrendChart = () => {
    if (!displayTrend.length) {
      return (
        <div className="bg-[#141416] rounded-xl border border-[#27272a] p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Token 日趋势</h3>
          </div>
          <p className="text-sm text-[#71717a]">暂无可用的历史 token 数据，下面仍会显示当前 Agent 的 token 分布。</p>
        </div>
      );
    }

    const chartWidth = 920;
    const chartHeight = 280;
    const paddingX = 28;
    const paddingY = 20;
    const innerWidth = chartWidth - paddingX * 2;
    const innerHeight = chartHeight - paddingY * 2;
    const xFor = (index: number) =>
      displayTrend.length === 1 ? chartWidth / 2 : paddingX + (index / (displayTrend.length - 1)) * innerWidth;
    const yFor = (value: number) => paddingY + innerHeight - (value / tokenTrendMax) * innerHeight;
    const buildPolyline = (values: number[]) =>
      values.map((value, index) => `${xFor(index)},${yFor(value)}`).join(" ");

    return (
      <div className="bg-[#141416] rounded-xl border border-[#27272a] p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Token 日趋势
            </h3>
            <p className="text-xs text-[#71717a] mt-1">
              按日查看总 Token 折线与各 Agent 消耗拆解（最近 {trendRange} 个自然日，含无数据日期）
            </p>
            <p className="text-xs text-cyan-300 mt-1">
              Token 数据截止：{formatFullDateTime(latestSupabaseSyncAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-[#71717a]">近 {trendRange} 天总量</p>
              <p className="text-xl font-bold text-yellow-400">{(totalRangeTokens / 1000).toFixed(1)}k</p>
            </div>
            <div className="flex bg-[#0f0f10] border border-[#27272a] rounded-lg p-1">
              {[7, 14, 30].map((range) => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range as 7 | 14 | 30)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    trendRange === range ? "bg-yellow-500/20 text-yellow-300" : "text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {range}天
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f10] rounded-xl border border-[#27272a] p-4">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[320px] overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + innerHeight - innerHeight * ratio;
              return (
                <g key={ratio}>
                  <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={6} y={y + 4} fill="#71717a" fontSize="10">
                    {Math.round((tokenTrendMax * ratio) / 1000)}k
                  </text>
                </g>
              );
            })}

            {displayTrend.map((point, index) => (
              <text key={point.date} x={xFor(index)} y={chartHeight - 4} textAnchor="middle" fill="#a1a1aa" fontSize="10">
                {point.date.slice(5)}
              </text>
            ))}

            {lineSeries.map((series) => (
              <g key={series.key}>
                <polyline
                  fill="none"
                  stroke={series.color}
                  strokeWidth={series.key === "total" ? 3 : 2}
                  points={buildPolyline(series.values)}
                  opacity={series.key === "total" ? 1 : 0.85}
                />
                {series.values.map((value, index) => (
                  <circle
                    key={`${series.key}-${index}`}
                    cx={xFor(index)}
                    cy={yFor(value)}
                    r={series.key === "total" ? 4 : 2.5}
                    fill={series.color}
                  >
                    <title>{`${series.label} · ${displayTrend[index].date} · ${value.toLocaleString()} tokens`}</title>
                  </circle>
                ))}
              </g>
            ))}
          </svg>

          <div className="mt-4 flex flex-wrap gap-3">
            {lineSeries.map((series) => (
              <div key={series.key} className="flex items-center gap-2 text-xs text-[#d4d4d8] bg-[#141416] rounded-lg px-3 py-1.5 border border-[#27272a]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                <span>{series.label}</span>
                <span className="text-[#71717a]">{(series.values.reduce((sum, value) => sum + value, 0) / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTokenDistributionChart = () => {
    return (
      <div className="bg-[#141416] rounded-xl border border-[#27272a] p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold">Token 分布（近 {trendRange} 天）</h3>
        </div>
        <p className="text-xs text-[#71717a] mb-4">基于当前所选时间范围内的历史 Token 聚合，和上方趋势图保持同一时间维度。</p>

        {!tokenDistribution.length ? (
          <p className="text-sm text-[#71717a]">暂无可展示的 token 数据。</p>
        ) : (
          <div className="space-y-4">
            {tokenDistribution.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2 text-[#d4d4d8]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[#f4f4f5] font-medium">{(item.value / 1000).toFixed(1)}k</span>
                </div>
                <div className="h-3 bg-[#0f0f10] rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((item.value / tokenDistributionMax) * 100, 6)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染Agent中心
  const renderAgents = () => {
    const totalTasks = agentCards.reduce((sum, a) => sum + a.tasks, 0);
    const totalCompleted = agentCards.reduce((sum, a) => sum + a.completedTasks, 0);
    const totalFailed = agentCards.reduce((sum, a) => sum + a.failedTasks, 0);
    const totalTokens = totalRangeTokens;

    return (
      <div className="p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-purple-400" />
            Agent中心
          </h2>
        </div>

        {renderTokenTrendChart()}
        {renderTokenDistributionChart()}

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a]">
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              <span className="text-[#a1a1aa] text-sm">总任务</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalTasks}</p>
          </div>
          <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a]">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-[#a1a1aa] text-sm">已完成</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
          </div>
          <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a]">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-[#a1a1aa] text-sm">失败</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
          </div>
          <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a]">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-[#a1a1aa] text-sm">近{trendRange}天 Token</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{(totalTokens / 1000).toFixed(1)}k</p>
          </div>
        </div>

        {/* Agent列表 */}
        <div className="space-y-4">
          {agentCards.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#141416] p-5 rounded-xl border border-[#27272a] hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  {getStatusIcon(agent.status)}
                </div>
                <span className="text-xs text-[#71717a]">{agent.lastRun}</span>
              </div>
              <p className="text-sm text-[#a1a1aa] mb-4">{agent.description}</p>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-[#71717a] text-xs">模型</p>
                  <p className="text-blue-400 text-xs">{agent.model}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs">任务数</p>
                  <p className="text-white">{agent.tasks}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs">完成</p>
                  <p className="text-green-400">{agent.completedTasks}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs">失败</p>
                  <p className="text-red-400">{agent.failedTasks}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs">近{trendRange}天 Token</p>
                  <p className="text-yellow-400">{((rangeTokenUsageByAgent[agent.id] || 0) / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染任务中心
  const renderTasks = () => (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-green-400" />
          任务中心
        </h2>
        <div className="text-right">
          <p className="text-xs text-[#71717a]">Supabase 最近同步</p>
          <p className="text-sm text-cyan-300 font-medium">{formatFullDateTime(latestSupabaseSyncAt)}</p>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="搜索任务（按回车执行）..."
          value={draftSearchQuery}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 任务统计 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a] flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold">{stats.activeTasks}</p>
            <p className="text-xs text-[#a1a1aa]">正常运行</p>
          </div>
        </div>
        <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a] flex items-center gap-4">
          <XCircle className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-2xl font-bold">{stats.errorTasks}</p>
            <p className="text-xs text-[#a1a1aa]">异常任务</p>
          </div>
        </div>
        <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a] flex items-center gap-4">
          <Clock className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-[#a1a1aa]">总任务数</p>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-[#141416] p-4 rounded-xl border transition-colors ${
              task.status === "error"
                ? "border-red-500/30 hover:border-red-500/50"
                : "border-[#27272a] hover:border-green-500/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <h3 className="font-semibold">{task.name}</h3>
                {task.errorCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                    {task.errorCount}次错误
                  </span>
                )}
              </div>
              <span className="text-xs text-[#a1a1aa] bg-[#27272a] px-2 py-1 rounded">
                {task.schedule}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[#a1a1aa] text-xs">上次运行</p>
                <p className="text-white">{formatDateTime(task.lastRun)}</p>
              </div>
              <div>
                <p className="text-[#a1a1aa] text-xs">运行时长</p>
                <p className="text-white">{task.lastDuration || "—"}</p>
              </div>
              <div>
                <p className="text-[#a1a1aa] text-xs">下次运行</p>
                <p className="text-white">{formatDateTime(task.nextRun)}</p>
              </div>
              <div>
                <p className="text-[#a1a1aa] text-xs">Token</p>
                <p className="text-yellow-400">{task.tokenUsage.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AuthCheck>
    <div className="flex min-h-screen bg-[#0a0a0b]">
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto">
        {/* 全局搜索区域 */}
        {searchQuery && (
          <div className="p-8 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Search className="w-7 h-7 text-blue-400" />
                搜索结果
              </h2>
              <p className="text-[#71717a]">关键词: "{searchQuery}"</p>
            </div>

            {/* 记忆搜索结果 */}
            {searchedMemories.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#a1a1aa] mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  记忆 ({searchedMemories.length})
                </h3>
                <div className="space-y-3">
                  {searchedMemories.map((m) => (
                    <div key={m.id} onClick={() => {setSelectedItem(m); setActiveTab("memories");}} className="bg-[#141416] p-4 rounded-xl border border-[#27272a] hover:border-purple-500/50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        {getMemoryTypeIcon(m.type)}
                        <span className="font-semibold">{m.title}</span>
                        <span className="text-xs text-[#71717a] ml-auto">{m.date}</span>
                      </div>
                      <p className="text-sm text-[#a1a1aa] line-clamp-2">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 文档搜索结果 */}
            {searchedDocuments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#a1a1aa] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  文档 ({searchedDocuments.length})
                </h3>
                <div className="space-y-3">
                  {searchedDocuments.map((d) => (
                    <div key={d.id} onClick={() => {setSelectedItem(d); setActiveTab("documents");}} className="bg-[#141416] p-4 rounded-xl border border-[#27272a] hover:border-blue-500/50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentTypeIcon(d.type)}
                        <span className="font-semibold">{d.title}</span>
                        <span className="text-xs text-[#71717a] ml-auto">{d.date}</span>
                      </div>
                      <p className="text-sm text-[#a1a1aa] truncate">{d.path}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 任务搜索结果 */}
            {searchedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#a1a1aa] mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  任务 ({searchedTasks.length})
                </h3>
                <div className="space-y-3">
                  {searchedTasks.map((t) => (
                    <div key={t.id} onClick={() => setActiveTab("tasks")} className="bg-[#141416] p-4 rounded-xl border border-[#27272a] hover:border-green-500/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(t.status)}
                        <span className="font-semibold">{t.name}</span>
                        <span className="text-xs text-[#71717a] ml-auto">{t.schedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 无结果 */}
            {searchedMemories.length === 0 && searchedDocuments.length === 0 && searchedTasks.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-[#3f3f46] mx-auto mb-4" />
                <p className="text-[#71717a]">未找到相关结果</p>
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <>
            {activeTab === "home" && renderHome()}
            {activeTab === "memories" && renderMemories()}
            {activeTab === "documents" && renderDocuments()}
            {activeTab === "tasks" && renderTasks()}
            {activeTab === "agents" && renderAgents()}
            {activeTab === "team" && renderTeam()}
            {activeTab === "office" && renderOffice()}
          </>
        )}
      </main>
    </div>
    </AuthCheck>
  );
}
