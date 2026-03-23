"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RdMemo {
  id: string;
  title: string;
  date: string;
  round: number;
  status: string;
  project: string;
  strategistProposal: string;
  productProposal: string;
  devilProposal: string;
  finalMemo: string;
}

const PROJECT_LABELS: Record<string, string> = {
  "AI培训": "AI培训",
  "AI咨询": "AI咨询",
  "AI陪跑": "AI陪跑",
};

const STATUS_COLORS: Record<string, string> = {
  "已完成": "bg-green-500/20 text-green-300 border-green-500/30",
  "三角辩论中": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "构思中": "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const AGENTS = [
  {
    id: "strategist",
    name: "策略师 Strategist",
    model: "MiniMax-M2.7",
    icon: "📊",
    color: "blue",
    desc: "专注增长与营收机会，从市场和竞品视角提出新想法。",
    focus: "增长 · 营收 · 市场份额 · 商业化路径",
  },
  {
    id: "product",
    name: "产品官 Product Officer",
    model: "Kimi 2.5",
    icon: "🎯",
    color: "purple",
    desc: "关注产品体验与功能改进，从用户反馈和交互角度思考。",
    focus: "用户体验 · 功能优化 · 需求优先级 · 交付标准化",
  },
  {
    id: "advocate",
    name: "批评者 Devil's Advocate",
    model: "GPT-5.4",
    icon: "⚔️",
    color: "red",
    desc: "挑战其他两人的观点，找出漏洞与潜在风险。",
    focus: "风险控制 · 可持续性 · 竞品教训 · 潜在问题",
  },
];

export default function RdMemosPage() {
  const [memos, setMemos] = useState<RdMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("全部");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    async function fetchMemos() {
      setLoading(true);
      try {
        const res = await fetch("/api/rd-memos");
        const data = await res.json();
        if (data.memos) {
          setMemos(data.memos);
          setLastUpdated(new Date(data.timestamp).toLocaleString("zh-CN"));
        }
      } catch (e) {
        console.error("Failed to fetch memos:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMemos();
  }, []);

  const filtered = filterProject === "全部"
    ? memos
    : memos.filter((m) => m.project === filterProject);

  const byProject = (project: string) => {
    const count = memos.filter((m) => m.project === project).length;
    return count;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f22] bg-[#0d0d10]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🧠</span>
                <h1 className="text-2xl font-bold">R&D 智囊团</h1>
                <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
                  三角辩论运行中
                </span>
              </div>
              <p className="text-[#71717a] text-sm">
                三个 AI 模型每日辩论两次，为 AI培训 · AI咨询 · AI陪跑 三个 P0 方向持续产出战略建议
              </p>
            </div>
            <div className="text-right text-xs text-[#3f3f46] shrink-0">
              {lastUpdated && <><div>最近更新</div><div className="text-[#71717a]">{lastUpdated}</div></>}
            </div>
          </div>

          {/* P0 项目统计 */}
          <div className="flex gap-3 mt-5 flex-wrap">
            {["全部", "AI培训", "AI咨询", "AI陪跑"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterProject(p)}
                className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                  filterProject === p
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : "bg-[#141416] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]"
                }`}
              >
                {p} {p !== "全部" && `(${byProject(p)})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* 三角色卡片 */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[#a1a1aa]">三角辩论阵容</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="rounded-2xl border border-[#27272a] bg-[#141416] p-5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{agent.name}</p>
                    <p className="text-xs text-[#71717a]">{agent.model}</p>
                  </div>
                </div>
                <p className="text-xs text-[#a1a1aa] mb-3 leading-relaxed">{agent.desc}</p>
                <div className="text-xs text-[#52525b] bg-[#1f1f22] rounded-lg px-3 py-2">
                  {agent.focus}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 工作流 */}
        <section className="bg-[#141416] rounded-2xl border border-[#27272a] p-5">
          <h2 className="text-sm font-semibold mb-4 text-[#a1a1aa]">辩论工作流</h2>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {[
              { step: "1", label: "输入项目现状", color: "bg-blue-500/20 text-blue-300" },
              { step: "2", label: "策略师·产品官·批评者独立提议", color: "bg-purple-500/20 text-purple-300" },
              { step: "3", label: "三方互相点评", color: "bg-yellow-500/20 text-yellow-300" },
              { step: "4", label: "综合产出最终Memo", color: "bg-green-500/20 text-green-300" },
              { step: "5", label: "写入飞书Bitable + 推送飞书", color: "bg-sky-500/20 text-sky-300" },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.color}`}>
                  {item.step}
                </span>
                <span className="text-[#71717a]">{item.label}</span>
                {i < arr.length - 1 && <span className="text-[#27272a] ml-1">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-[#3f3f46]">
            <span>⏰ 每天 09:00 和 21:00 各执行一轮</span>
            <span>📊 Supabase 存储 · 飞书 Bitable 记录 · 飞书消息推送</span>
          </div>
        </section>

        {/* Memo 列表 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#a1a1aa]">
              产出记录 {filtered.length > 0 && `(${filtered.length}条)`}
            </h2>
            {loading && <span className="text-xs text-[#3f3f46] animate-pulse">加载中...</span>}
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#3f3f46] text-sm">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#141416] rounded-2xl border border-[#27272a]">
              <div className="text-4xl mb-4">🧠</div>
              <p className="text-[#71717a]">暂无辩论记录</p>
              <p className="text-xs text-[#3f3f46] mt-2">每天 09:00 和 21:00 自动触发三角辩论</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((memo) => (
                <div
                  key={memo.id}
                  className="bg-[#141416] rounded-2xl border border-[#27272a] overflow-hidden hover:border-blue-500/20 transition-all"
                >
                  {/* 展开头部 */}
                  <button
                    onClick={() => setExpandedId(expandedId === memo.id ? null : memo.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{memo.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[memo.status] || "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                            {memo.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded border bg-[#27272a] text-[#71717a]">
                            {memo.project}
                          </span>
                          <span className="text-xs text-[#52525b]">第{memo.round}轮</span>
                        </div>
                        <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                          {memo.finalMemo?.replace(/\n/g, " · ").substring(0, 120)}
                          {(memo.finalMemo?.length || 0) > 120 ? "…" : ""}
                        </p>
                      </div>
                      <span className="text-[#27272a] text-lg shrink-0 mt-1">
                        {expandedId === memo.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* 展开详情 */}
                  {expandedId === memo.id && (
                    <div className="px-5 pb-5 border-t border-[#27272a] pt-4 space-y-4">
                      {/* 三方提议 */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {[
                          { icon: "📊", label: "策略师 Strategist", text: memo.strategistProposal, color: "blue" },
                          { icon: "🎯", label: "产品官 Product", text: memo.productProposal, color: "purple" },
                          { icon: "⚔️", label: "批评者 Advocate", text: memo.devilProposal, color: "red" },
                        ].map((item) => (
                          <div key={item.label} className="bg-[#1f1f22] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">{item.icon}</span>
                              <span className={`text-sm font-semibold text-${item.color}-300`}>{item.label}</span>
                            </div>
                            <p className="text-xs text-[#c4c4c4] leading-relaxed whitespace-pre-wrap">
                              {item.text || "暂无提议"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* 最终 Memo */}
                      {memo.finalMemo && (
                        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#141416] rounded-xl p-5 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">📝</span>
                            <span className="text-sm font-semibold text-blue-300">最终 Memo</span>
                          </div>
                          <pre className="text-xs text-[#e4e4e7] leading-relaxed whitespace-pre-wrap font-sans">
                            {memo.finalMemo}
                          </pre>
                        </div>
                      )}

                      <div className="text-xs text-[#3f3f46] flex items-center justify-between">
                        <span>{memo.date} · R&D 智囊团第 {memo.round} 轮</span>
                        <a
                          href="https://my.feishu.cn/base/L0qDbUS5ma16tmsd5NkcX35Jnml"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          飞书 Dashboard →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* P0 方向说明 */}
        <section className="bg-[#141416] rounded-2xl border border-[#27272a] p-5">
          <h2 className="text-sm font-semibold mb-4 text-[#a1a1aa]">P0 产品优先级</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "AI培训", icon: "🎓", desc: "线下AI培训（尤其OpenClaw生态），面向B端企业、中小企业主、职业人士" },
              { name: "AI咨询", icon: "💼", desc: "长期AI咨询陪跑，帮助企业落地AI应用，建立专属AI工作流" },
              { name: "AI陪跑", icon: "🚀", desc: "商业教练服务，持续陪伴创始人/团队AI转型，按月/季度交付" },
            ].map((p) => (
              <div key={p.name} className="bg-[#1f1f22] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-semibold text-white text-sm">{p.name}</span>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
