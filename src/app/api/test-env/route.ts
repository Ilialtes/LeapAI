import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    openai_key_length: process.env.OPENAI_API_KEY?.length || 0,
    node_env: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
  });
}