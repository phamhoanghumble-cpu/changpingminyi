import type {Metadata} from 'next';
import './globals.css';

const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY||'';

export const metadata:Metadata={
  title:'建材路·居民反馈｜非机动车道去哪了？',
  description:'建材路附近居民关于停车划线、非机动车通行、公示与回访的反馈梳理。撤除不合理泊位，恢复安全通行。',
  icons:{icon:'/favicon.svg'},
};

declare global{interface Window{__TURNSTILE_SITEKEY__?:string}}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="zh-CN">
      <head>
        <meta name="turnstile-sitekey" content={sitekey}/>
        <script dangerouslySetInnerHTML={{__html:`window.__TURNSTILE_SITEKEY__=${JSON.stringify(sitekey)};`}}/>
      </head>
      <body>{children}</body>
    </html>
  );
}