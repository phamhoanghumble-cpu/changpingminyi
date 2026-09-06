import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={
  title:'建材路·居民反馈｜非机动车道去哪了？',
  description:'建材路附近居民关于停车划线、非机动车通行、公示与回访的反馈梳理。撤除不合理泊位，恢复安全通行。',
  icons:{icon:'/favicon.svg'},
};export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}