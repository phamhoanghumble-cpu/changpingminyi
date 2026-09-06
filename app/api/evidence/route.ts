import { database } from '@/db/raw';
import { isMaterialCategory } from '@/lib/material-categories';

export async function GET(request?: Request) {
  const category = request ? new URL(request.url).searchParams.get('category') || '' : '';
  if (category && !isMaterialCategory(category)) {
    return Response.json({ error: '材料分类无效。' }, { status: 400 });
  }
  try {
    let query = database().prepare(`SELECT id,title,content,location,event_date,created_at,files,category
      FROM materials WHERE status='published' AND consent=1 ${category ? 'AND category=?' : ''}
      ORDER BY created_at DESC LIMIT 60`);
    if (category) query = query.bind(category);
    const result = await query.all();
    return Response.json({ items: result.results.map((row: any) => ({
      ...row,
      files: JSON.parse(row.files).map((file: any, index: number) => ({
        name: file.name, type: file.type, url: `/api/media?id=${row.id}&index=${index}`,
      })),
    })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: '公开材料暂时无法加载，请稍后重试。' }, { status: 503 });
  }
}
