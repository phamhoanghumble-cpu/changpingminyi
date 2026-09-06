"use client"
import {useEffect,useRef,useState} from 'react'
declare global{interface Window{turnstile?:{render:(el:HTMLElement,opts:Record<string,unknown>)=>string;reset:(id?:string)=>void;remove:(id?:string)=>void};__TURNSTILE_SITEKEY__?:string}}
const TURNSTILE_SCRIPT='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnload'

function getSitekey(prop?:string):string{
  if(prop)return prop
  if(typeof document!=='undefined'){
    const meta=document.querySelector('meta[name="turnstile-sitekey"]') as HTMLMetaElement|null
    if(meta?.content)return meta.content
  }
  if(typeof window!=='undefined'&&window.__TURNSTILE_SITEKEY__)return window.__TURNSTILE_SITEKEY__
  return ''
}

export function Turnstile({
  sitekey:sitekeyProp,
  onToken,
  className,
}:{
  sitekey?:string
  onToken:(token:string)=>void
  className?:string
}){
  const ref=useRef<HTMLDivElement>(null)
  const idRef=useRef<string>('')
  const [ready,setReady]=useState(false)
  const [sitekey,setSitekey]=useState(()=>getSitekey(sitekeyProp))

  useEffect(()=>{
    const v=getSitekey(sitekeyProp)
    if(v!==sitekey)setSitekey(v)
  },[sitekeyProp,sitekey])

  useEffect(()=>{
    if(typeof window==='undefined')return
    if(window.turnstile){setReady(true);return}
    const anyWin=window as unknown as Record<string,()=>void>
    anyWin.__turnstileOnload=()=>setReady(true)
    if(document.querySelector(`script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]`))return
    const s=document.createElement('script')
    s.src=TURNSTILE_SCRIPT
    s.async=true
    s.defer=true
    document.head.appendChild(s)
  },[])

  useEffect(()=>{
    if(!ready||!ref.current||!sitekey||idRef.current)return
    if(!window.turnstile)return
    idRef.current=window.turnstile.render(ref.current,{
      sitekey,
      callback:(token:string)=>onToken(token),
      'expired-callback':()=>onToken(''),
      'error-callback':()=>onToken(''),
      theme:'light',
      size:'flexible',
    })
    return()=>{
      try{window.turnstile?.remove(idRef.current)}catch{}
      idRef.current=''
    }
  },[ready,sitekey,onToken])

  if(!sitekey)return null
  return <div ref={ref} className={className} />
}