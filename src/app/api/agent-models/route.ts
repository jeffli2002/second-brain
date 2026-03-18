import { NextResponse } from 'next/server';

// 从环境变量或GitHub获取OpenClaw配置
const GITHUB_RAW_URL = process.env.OPENCLAW_CONFIG_URL || 'https://raw.githubusercontent.com/openclaw/openclaw/main/config/openclaw.json';

export async function GET() {
  try {
    // 尝试从GitHub获取配置
    const response = await fetch(GITHUB_RAW_URL, {
      next: { revalidate: 60 } // 缓存60秒
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    
    const config = await response.json();
    
    const agents = config.agents || {};
    const defaults = agents.defaults || {};
    const models = defaults.models || {};
    
    // Map agent IDs to their primary model
    const agentModels: Record<string, string> = {};
    
    // Get all agent configs
    for (const [agentId, agentConfig] of Object.entries(agents)) {
      if (agentId === 'defaults') continue;
      
      const config = agentConfig as any;
      if (config.model?.primary) {
        const modelPath = config.model.primary;
        const modelAlias = models[modelPath]?.alias || modelPath;
        agentModels[agentId] = modelAlias;
      }
    }
    
    return NextResponse.json({
      success: true,
      agents: agentModels,
      defaults: {
        primary: models[defaults.model?.primary]?.alias || defaults.model?.primary,
        fallbacks: defaults.model?.fallbacks?.map((m: string) => models[m]?.alias || m) || []
      }
    });
  } catch (error) {
    console.error('Failed to read agent models:', error);
    // 返回默认配置作为后备
    return NextResponse.json({
      success: true,
      agents: {
        chief: 'MiniMax M2.5',
        content: 'Kimi K2.5',
        coding: 'GPT-5.4',
        growth: 'MiniMax M2.5',
        product: 'MiniMax M2.5',
        finance: 'MiniMax M2.5'
      },
      defaults: {
        primary: 'MiniMax M2.5',
        fallbacks: ['Kimi K2.5', 'GPT-5.4']
      },
      fromCache: true
    });
  }
}
