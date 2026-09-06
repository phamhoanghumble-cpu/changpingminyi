import {env} from 'cloudflare:workers';
import {database} from '@/db/raw';
import {verifyTurnstile} from '@/lib/turnstile';
export async function GET(){try{const r=await database().prepare("SELECT id,title,content,location,event_date,created_at,files,file_count FROM materials WHERE status='published' AND consent=1 ORDER BY created_at DESC LIMIT 6").all();return Response.json({items:r.results.map((row:any)=>({...row,files:JSON.parse(row.files).map((f:any,i:number)=>({name:f.name,type:f.type,url:'/api/media?id='+row.id+'&index='+i}))}))},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('Material listing failed',e);return Response.json({error:'暂时无法读取材料，请稍后重试。'},{status:503})}}
const extensions=new Set(['jpg','jpeg','png','webp','heic','mp4','mov','mp3','m4a','wav','pdf','doc','docx','txt']);
export async function POST(request:Request){
 const saved:string[]=[];
 try{
  if(request.headers.get('sec-fetch-site')==='cross-site')return Response.json({error:'请从本站提交。'},{status:403});
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return Response.json({error:'请使用材料提交表单。'},{status:400});
  const limit=22*1024*1024;if(Number(request.headers.get('content-length')||0)>limit)return Response.json({error:'附件总大小不能超过20MB。'},{status:413});
  const reader=request.body?.getReader();if(!reader)return Response.json({error:'提交内容为空。'},{status:400});
  let size=0;const chunks:Uint8Array[]=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();return Response.json({error:'附件总大小不能超过20MB。'},{status:413})}chunks.push(value)}
  const form=await new Response(new Blob(chunks as BlobPart[]),{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();
  const title=String(form.get('title')||'').trim(),content=String(form.get('content')||'').trim(),location=String(form.get('location')||'').trim(),eventDate=String(form.get('eventDate')||'');
  const turnstileToken=String(form.get('cf-turnstile-response')||'');
  if(!(await verifyTurnstile(turnstileToken,request.headers.get('cf-connecting-ip'))))return Response.json({error:'人机校验未通过，请刷新页面重试。'},{status:400});
  const files=form.getAll('files').filter((x):x is File=>x instanceof File&&x.size>0);
  if(!title||title.length>120||content.length<5||content.length>10000||location.length>200||eventDate.length>10)return Response.json({error:'请填写有效标题与至少5个字的情况说明。'},{status:400});
  if(eventDate&&!/^\d{4}-\d{2}-\d{2}$/.test(eventDate))return Response.json({error:'日期格式不正确。'},{status:400});
  if(files.length<1)return Response.json({error:'请至少上传1个附件，现场照片、视频、录音或文件均可。'},{status:400});
  if(files.length>5||files.reduce((n,f)=>n+f.size,0)>20*1024*1024||files.some(f=>!extensions.has(f.name.split('.').pop()?.toLowerCase()||'')))return Response.json({error:'请上传1—5个受支持的附件，总大小不超过20MB。'},{status:400});
  if(form.get('publicConsent')!=='yes')return Response.json({error:'直接展示需要确认公开授权与隐私提示。'},{status:400});
  const db=database();if(files.length&&!env.BUCKET)throw Error('Storage unavailable');
  const id=crypto.randomUUID();const meta=[];
  for(const f of files){const key='materials/'+id+'/'+crypto.randomUUID();await env.BUCKET!.put(key,f.stream(),{httpMetadata:{contentType:'application/octet-stream'}});saved.push(key);meta.push({key,name:f.name.slice(0,240),size:f.size,type:({'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','webp':'image/webp','mp4':'video/mp4','mov':'video/quicktime','mp3':'audio/mpeg','m4a':'audio/mp4','wav':'audio/wav'} as Record<string,string>)[f.name.split('.').pop()?.toLowerCase()||'']||'application/octet-stream'})}
  await db.prepare('INSERT INTO materials (id,title,content,location,event_date,created_at,files,file_count,status,consent) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,title,content,location,eventDate,new Date().toISOString(),JSON.stringify(meta),files.length,'published',1).run();
  return Response.json({id,status:'published'},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Material submission failed',e);await Promise.allSettled(saved.map(k=>env.BUCKET!.delete(k)));return Response.json({error:'暂时无法保存，请保留内容并稍后重试。'},{status:503})}
}
