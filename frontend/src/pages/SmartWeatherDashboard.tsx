import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Monitor, ShieldAlert, UserCheck, 
  Compass, RefreshCw, Cpu, Activity, Clock, Battery, Wifi 
} from 'lucide-react';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

// Background Food Pattern Import
import bgPattern from '../assets/food_drawing.jpg';

export default function SmartWeatherDashboard() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isRealMobileDevice, setIsRealMobileDevice] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [weatherCache, setWeatherCache] = useState({ temp: 74, city: 'Bandung', cond: 'Partly Cloudy' });

  // 1. Live Ticking Clock for Status Bar & Console
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setLiveTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real Mobile Detection to bypass frame layout
  useEffect(() => {
    const checkViewport = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 820;
      setIsRealMobileDevice(isMobileUA || isSmallScreen);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 3. Keep local weather cache synced in presentation console
  useEffect(() => {
    const checkWeather = () => {
      try {
        const stored = localStorage.getItem('cookedu_last_weather');
        if (stored) {
          const parsed = JSON.parse(stored);
          setWeatherCache({
            temp: parsed.temp || 74,
            city: parsed.city || 'Bandung',
            cond: parsed.condition || 'Partly Cloudy'
          });
        }
      } catch (e) {}
    };
    checkWeather();
    const interval = setInterval(checkWeather, 2000);
    return () => clearInterval(interval);
  }, []);

  // If visitor is on a real mobile device, automatically render full screen native
  if (isRealMobileDevice) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] text-slate-700 font-sans transition-all duration-300">
        {currentView === 'user' ? (
          <UserDashboard onSwitchView={setCurrentView} />
        ) : (
          <AdminDashboard onSwitchView={setCurrentView} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-700 font-sans flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      {/* ================= LEFT PRESENTATION SIDEBAR ================= */}
      <aside className="w-full lg:w-[350px] shrink-0 bg-white/80 backdrop-blur-2xl border-b lg:border-b-0 lg:border-r border-sky-100 p-6 flex flex-col justify-between z-20 shadow-lg relative">
        <div className="space-y-8">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none">CookEdu Simulator</h2>
              <span className="text-[9px] font-bold text-sky-600 uppercase tracking-widest block mt-1">Responsive Live Shell</span>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-left">Pilih Kontrol Akses</h3>
            <div className="grid grid-cols-2 gap-2 bg-sky-50/70 p-1.5 rounded-2xl border border-sky-100/50">
              <button
                onClick={() => setCurrentView('user')}
                className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all ${
                  currentView === 'user' 
                    ? 'bg-white text-sky-600 shadow-sm border border-sky-100/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Standard
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all ${
                  currentView === 'admin' 
                    ? 'bg-white text-teal-600 shadow-sm border border-sky-100/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Super Admin
              </button>
            </div>
          </div>

          {/* Interactive Screen Device Switcher */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-left">Mode Tampilan Layar</h3>
            <div className="grid grid-cols-2 gap-2 bg-sky-50/70 p-1.5 rounded-2xl border border-sky-100/50">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all ${
                  deviceMode === 'mobile' 
                    ? 'bg-white text-sky-600 shadow-sm border border-sky-100/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Chassis Mobile
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all ${
                  deviceMode === 'desktop' 
                    ? 'bg-white text-teal-600 shadow-sm border border-sky-100/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Expanded Desk
              </button>
            </div>
          </div>

          {/* Live System Geocoding & Weather Telemetry */}
          <div className="bg-sky-50/50 border border-sky-100/80 rounded-2xl p-4 space-y-3.5 text-left">
            <div className="flex items-center gap-2 text-slate-650">
              <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Telemetri Dapur</span>
            </div>
            
            <div className="space-y-2.5 text-[11px] font-semibold">
              <div className="flex justify-between border-b border-sky-100/50 pb-1.5">
                <span className="text-slate-400">Kota Lokasi:</span>
                <span className="text-slate-850 font-black">{weatherCache.city}</span>
              </div>
              <div className="flex justify-between border-b border-sky-100/50 pb-1.5">
                <span className="text-slate-400">Suhu Sync:</span>
                <span className="text-sky-600 font-black">{weatherCache.temp}°C</span>
              </div>
              <div className="flex justify-between border-b border-sky-100/50 pb-1.5">
                <span className="text-slate-400">Status Cuaca:</span>
                <span className="text-teal-600 font-black">{weatherCache.cond}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Server:</span>
                <span className="text-slate-600 font-mono font-black">{liveTime}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Presentational Credits */}
        <div className="pt-6 border-t border-sky-100/60 text-left mt-8">
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-wider">Engine: CookEdu v4.0</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 leading-relaxed mt-1.5">
            Gunakan panel ini untuk menguji responsivitas android/ios & desktop dalam satu layar demo!
          </p>
        </div>
      </aside>

      {/* ================= RIGHT VIEWPORT WORKSPACE CONTAINER ================= */}
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8 z-10 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {deviceMode === 'mobile' ? (
            /* ================= smartphone simulator frame viewport ================= */
            <motion.div
              key="mobile-chassis"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="w-[375px] h-[780px] rounded-[52px] border-[12px] border-slate-900 bg-white shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-800/30 scale-[0.85] sm:scale-95 md:scale-100"
            >
              {/* simulated phone physical camera notch/top speaker */}
              <div className="absolute top-0 inset-x-0 mx-auto w-36 h-6 bg-slate-900 rounded-b-2xl z-[150] flex items-center justify-center">
                <div className="w-16 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* simulated phone status bar */}
              <div className="h-10 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-[140] shrink-0 text-slate-700 text-[10px] font-black border-b border-sky-100/20">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-650" />
                  <span>{liveTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-650" />
                  <Battery className="w-4 h-4 text-slate-650" />
                  <span>85%</span>
                </div>
              </div>

              {/* inner phone app content body with scroll isolation */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
                {currentView === 'user' ? (
                  <UserDashboard onSwitchView={setCurrentView} />
                ) : (
                  <AdminDashboard onSwitchView={setCurrentView} />
                )}
              </div>

              {/* simulated phone bottom swipe pill navigation */}
              <div className="h-6 bg-white/70 backdrop-blur-md flex items-center justify-center z-[140] shrink-0 border-t border-sky-100/20">
                <div className="w-28 h-1 bg-slate-900/40 rounded-full" />
              </div>

            </motion.div>
          ) : (
            /* ================= expanded desktop view viewport ================= */
            <motion.div
              key="desktop-screen"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full h-full bg-white/50 backdrop-blur-md rounded-[32px] border border-sky-150 shadow-2xl flex flex-col overflow-hidden max-w-6xl mx-auto"
            >
              {/* browser-like title header */}
              <div className="h-10 bg-white/70 border-b border-sky-150 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-sky-50/70 border border-sky-100 rounded-lg px-24 py-1 text-[10px] text-slate-400 font-bold select-none truncate max-w-sm">
                  http://localhost:5173/smart-weather
                </div>
                <div className="w-10" />
              </div>

              {/* browser screen viewport content scroll area */}
              <div className="flex-1 overflow-y-auto">
                {currentView === 'user' ? (
                  <UserDashboard onSwitchView={setCurrentView} />
                ) : (
                  <AdminDashboard onSwitchView={setCurrentView} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
