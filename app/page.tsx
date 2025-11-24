'use client'

import dynamic from 'next/dynamic'

const DesertScene = dynamic(() => import('@/components/DesertScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      fontSize: '1.5rem'
    }}>
      加载中...
    </div>
  )
})

export default function Home() {
  return <DesertScene />
}
