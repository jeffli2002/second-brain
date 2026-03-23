import Link from "next/link";

export default function RdMemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Minimal top bar */}
      <div className="border-b border-[#1f1f22] bg-[#0d0d10] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧠</span>
          <span className="font-semibold text-white">R&D 智囊团</span>
          <span className="text-xs text-[#3f3f46]">by Second Brain</span>
        </div>
        <Link
          href="/"
          className="text-xs text-[#71717a] hover:text-white border border-[#27272a] rounded-lg px-3 py-1.5 transition-colors"
        >
          ← 返回第二大脑
        </Link>
      </div>
      {children}
    </div>
  );
}
