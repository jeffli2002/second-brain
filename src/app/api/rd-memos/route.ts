import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = 'https://njxjuvxosvwvluxefrzg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeGp1dnhvc3Z3dmx1eGVmcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjkyNTUsImV4cCI6MjA4NzQwNTI1NX0.FqfMyI3uSkiHVepWVccxFU4ie5RU00VVdrF-aOr9LjI';

export async function GET() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?type=eq.rd_memo&select=*&order=date.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const docs = await response.json();
    
    // Parse content JSON and reshape
    const memos = docs.map((doc: any) => {
      let data = {};
      try {
        if (doc.content) {
          data = JSON.parse(doc.content);
        }
      } catch {
        data = {};
      }
      return {
        id: doc.id,
        title: doc.title,
        date: doc.date,
        round: data.round || 1,
        status: data.status || '构思中',
        project: data.project || '通用',
        strategistProposal: data.strategist_proposal || '',
        productProposal: data.product_proposal || '',
        devilProposal: data.devil_proposal || '',
        finalMemo: data.final_memo || doc.content || '',
      };
    });

    return NextResponse.json({
      memos,
      total: memos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching R&D memos:', error);
    return NextResponse.json({
      memos: [],
      total: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
