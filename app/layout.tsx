import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '沙漠越野竞速 - Desert Racing Cinematic',
  description: 'Cinematic desert off-road racing experience with dynamic camera movements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
