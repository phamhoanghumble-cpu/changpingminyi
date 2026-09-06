import {env} from 'cloudflare:workers';
import {database} from '@/db/raw';
import {normalizePhone,privateHash,choices} from '@/lib/survey';
import {crossSite} from '@/lib/review';
import {verifyTurnstile} from '@/lib/turnstile';
export async function GET(){try{const rows=await database().prepare('SELECT choice,COUNT(*) AS count FROM votes GROUP BY choice').all();let support=0,oppose=0;for(const row of rows.results){if(row.choice==='support')support=Number(row.count);if(row.choice==='oppose')oppose=Number(row.count)}return Response.json({support,oppose,total:support+oppose,updatedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'投票统计暂时不可用。'},{status:503})}}
export async function POST(request:Request){
 try{
 if(crossSite(request))return Response.json({error:'请通过本站投票。'},{status:403});
 const raw=await request.text();if(raw.length>2048)return Response.json({error:'提交内容过长。'},{status:400});
 const data=JSON.parse(raw);
 if(!(await verifyTurnstile(String(data.turnstileToken||''),request.headers.get('cf-connecting-ip'))))return Response.json({error:'人机校验未通过，请刷新页面重试。'},{status:400});
 const phone=normalizePhone(data.phone);
 if(!phone||!choices.includes(data.choice)||data.consent!==true||data.resident!==true)return Response.json({error:'请填写有效的中国大陆手机号，选择立场并确认居民身份与隐私说明。'},{status:400});
 const secret=(env as unknown as Record<string,string>).VOTE_HMAC_SECRET;if(!secret)return Response.json({error:'投票暂未开放，请稍后再试。'},{status:503});
 const db=database(),ip=request.headers.get('cf-connecting-ip');
 if(ip){const bucket=await privateHash('limit:'+ip+':'+Math.floor(Date.now()/3600000),secret);const row=await db.prepare('INSERT INTO vote_limits (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(bucket).first<{count:number}>();if(row&&row.count>12)return Response.json({error:'当前网络提交过于频繁，请一小时后重试。'},{status:429});}
 const hash=await privateHash('jiancai-parking-v1:'+phone,secret);
 const result=await db.prepare('INSERT OR IGNORE INTO votes (phone_hash,choice,created_at) VALUES (?,?,?)').bind(hash,data.choice,new Date().toISOString()).run();
 if(!result.meta.changes)return Response.json({error:'该手机号已参与本次投票，不重复计票。'},{status:409});
 return Response.json({ok:true},{status:201});
 }catch{return Response.json({error:'本次未能完成投票，请稍后重试。'},{status:503})}
}