import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/newsService';

export async function GET() {
  try {
    const headlines = await fetchHeadlines();
    return NextResponse.json({ headlines, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news', success: false },
      { status: 500 }
    );
  }
}
