import { Outlet } from 'react-router-dom'
import AiAssistant from '../chat/AiAssistant'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'

export default function UserLayout() {
  const { isDesktop } = useDeviceProfile()

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-slate-50 font-sans text-slate-900">
        <AiAssistant />
        <header className="sticky top-0 z-50 border-b border-cyan-100/70 bg-white/90 backdrop-blur-xl">
          <TopNav />
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-8 py-8">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-slate-50 font-sans text-slate-900">
      <AiAssistant />
      <main className="mx-auto w-full px-0 pb-28">
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-4 pt-12 pointer-events-none">
        <div className="mx-auto max-w-md pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
