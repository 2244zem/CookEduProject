import { useState, useEffect } from 'react'
import { Bug, X, Activity, Terminal, Trash2, ChevronDown, ChevronUp, Cpu, HardDrive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebugStore } from '../../store/debugStore'

export default function DebugOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const { logs, clearLogs } = useDebugStore()
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState(0)

  // Notify on slow API or error
  useEffect(() => {
    const lastLog = logs[0]
    if (lastLog && (lastLog.duration > 2000 || lastLog.status >= 400)) {
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [logs])

  // FPS & Memory Monitor
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const checkPerformance = () => {
      const now = performance.now()
      frameCount++
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)))
        frameCount = 0
        lastTime = now
        // Memory (Chrome only)
        const mem = (performance as any).memory
        if (mem) setMemory(Math.round(mem.usedJSHeapSize / 1048576))
      }
      animationFrameId = requestAnimationFrame(checkPerformance)
    }
    animationFrameId = requestAnimationFrame(checkPerformance)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // Shake to Debug
  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const force = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0)
      if (force > 30) { // Shake threshold
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [])

  if (import.meta.env.MODE !== 'development' && !window.location.search.includes('debug=true')) return null

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button 
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl z-[9999] border border-white/10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bug className={`w-6 h-6 ${showNotification ? 'text-red-500 animate-bounce' : 'text-primary'}`} />
        {showNotification && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
        )}
      </motion.button>

      {/* Debug Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex flex-col md:items-end md:justify-end md:p-6 p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl h-[80vh] bg-slate-950 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden font-mono"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                   <Terminal className="w-5 h-5 text-primary" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Debug Console</h3>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={clearLogs} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 p-4 border-b border-white/10 bg-black/10">
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> FPS</p>
                    <p className={`text-xs font-black ${fps < 30 ? 'text-red-400' : 'text-green-400'}`}>{fps}</p>
                 </div>
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3" /> Mem</p>
                    <p className="text-xs font-black text-primary">{memory} MB</p>
                 </div>
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Latency</p>
                    <p className={`text-xs font-black ${logs[0]?.duration > 1000 ? 'text-red-400' : 'text-green-400'}`}>{logs[0]?.duration || 0}ms</p>
                 </div>
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Status</p>
                    <p className={`text-xs font-black ${logs[0]?.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>{logs[0]?.status || '---'}</p>
                 </div>
              </div>

              {/* Logs List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[10px] uppercase font-black tracking-widest">Listening for API events...</p>
                  </div>
                ) : logs.map((log) => (
                  <div key={log.id} className={`rounded-xl border transition-all ${log.status >= 400 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded ${log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{log.method}</span>
                         <span className="text-[10px] text-gray-300 truncate max-w-[200px]">{log.url}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-bold ${log.duration > 2000 ? 'text-red-400' : 'text-gray-500'}`}>{log.duration}ms</span>
                         {expandedLog === log.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedLog === log.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                          <div className="p-4 pt-0 space-y-4">
                             <div className="bg-black/40 rounded-lg p-3">
                                <p className="text-[8px] text-gray-500 uppercase mb-2">Metadata</p>
                                <pre className="text-[10px] text-gray-400">Timestamp: {log.timestamp}</pre>
                                {log.error && <pre className="text-[10px] text-red-400 mt-2">Error: {log.error}</pre>}
                             </div>
                             <button className="w-full py-2 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-lg">Copy cURL</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Bottom Info */}
              <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">System Healthy</span>
                 </div>
                 <span className="text-[8px] font-bold text-gray-600">CookEdu v2.0-DEBUG</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
