import { NextResponse } from 'next/server';

// 从环境变量获取OpenClaw配置URL（可选）
const GITHUB_RAW_URL = process.env.OPENCLAW_CONFIG_URL;

export async function GET() {
  // 默认模型配置（与openclaw.json一致）
  const defaultAgents = {
    chief: 'MiniMax M2.5',
    content: 'Kimi K2.5',
    coding: 'GPT-5.4',
    growth: 'MiniMax M2.5',
    product: 'MiniMax M2.5',
    finance: 'MiniMax M2.5'
  };
  
  // 如果配置了外部URL，尝试获取
  if (GITHUB_RAW_URL) {
    try {
      const response = await fetch(GITHUB_RAW_URL, {
        next: { revalidate: 60 }
      });
      
      if (response.ok) {
        const config = await response.json();
        const agents = config.agents || {};
        const defaults = agents.defaults || {};
        const models = defaults.models || {};
        
        const agentModels: Record<string, string> = {};
        
        for (const [agentId, agentConfig] of Object.entries(agents)) {
          if (agentId === 'defaults') continue;
          const cfg = agentConfig as any;
          if (cfg.model?.primary) {
            const modelPath = cfg.model.primary;
            agentModels[agentId] = models[modelPath]?.alias || modelPath;
          }
        }
        
        return NextResponse.json({
          success: true,
          agents: agentModels,
          source: 'external'
        });
      }
    } catch (error) {
      console.error('Failed to fetch external config:', error);
    }
  }
  
  // 返回默认配置
  return NextResponse.json({
    success: true,
    agents: defaultAgents,
    source: 'default'
  });
}
