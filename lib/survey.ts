export function normalizePhone(value:unknown){let s=String(value??'').replace(/[\s()-]/g,'');if(s.startsWith('+86'))s=s.slice(3);if(!/^1[3-9]\d{9}$/.test(s))return null;return s;}
export async function privateHash(value:string,secret:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export const choices=['support','oppose'] as const;
