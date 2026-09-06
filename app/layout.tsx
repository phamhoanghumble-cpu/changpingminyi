import type {Metadata} from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '车位画上了，非机动车该从哪里走？——北京昌平建材路停车泊位设置调查',
  description: '昌平东小口镇建材路居民反映非机动车道内施划停车泊位、分隔线被抹去，要求取消占道泊位、恢复非机动车专用道，并公开设置决定、交通组织方案、公告及安全评估材料。',
  icons: { icon: '/favicon.svg' },
  other: {
    'codex-preview': 'development',
  },
};export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}