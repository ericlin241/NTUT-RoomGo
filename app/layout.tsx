import type { Metadata } from 'next';
import { Noto_Sans_TC, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const noto = Noto_Sans_TC({ variable: '--font-noto', subsets: ['latin'], display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://ericlin241.github.io/NTUT-RoomGo/'),
  title: '北科課室通 NTUT RoomGo｜即時課表與教室查詢',
  description: '北科大學生專屬的即時課表、下一節課與教室資訊查詢工具。快速、清楚，手機與電腦都好用。',
  keywords: ['北科大', 'NTUT', '課表', '教室查詢', 'RoomGo'],
  openGraph: { title: '北科課室通 NTUT RoomGo', description: '現在在哪上課？下一堂在哪？打開 RoomGo，一眼就知道。', type: 'website', locale: 'zh_TW', url: 'https://ericlin241.github.io/NTUT-RoomGo/', images: [{ url: 'https://ericlin241.github.io/NTUT-RoomGo/og.png', width: 1200, height: 630, alt: '北科課室通 NTUT RoomGo 預覽圖' }] },
  twitter: { card: 'summary_large_image', title: '北科課室通 NTUT RoomGo', description: '北科大即時課表與教室查詢，一眼掌握下一堂課。', images: ['https://ericlin241.github.io/NTUT-RoomGo/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant" suppressHydrationWarning><body className={`${noto.variable} ${jakarta.variable}`}>{children}</body></html>;
}
