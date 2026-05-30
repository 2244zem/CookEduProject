import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, Sparkles, Utensils, Zap, Moon, Sun, CloudRain, ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../../store';

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  isRichContent?: boolean;
  richType?: 'recipe' | 'steps' | 'substitution' | 'standard';
}

export default function AiAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  
  // Stored weather retrieval
  const [weather, setWeather] = useState({
    temp: 74,
    condition: 'Partly Cloudy',
    city: 'Bandung'
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve weather from localStorage if exists
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cookedu_last_weather');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.temp && parsed.city) {
          setWeather({
            temp: Math.round(parsed.temp),
            condition: parsed.condition || 'Sunny',
            city: parsed.city
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse last weather, using fallback.', e);
    }
  }, []);

  // Initialize Chef AI Welcome Greeting based on weather
  useEffect(() => {
    const username = user?.name || 'Zem';
    const temp = weather.temp;
    let greetingText = '';

    if (temp >= 80) {
      // Hot day greeting
      greetingText = `Halo Kak ${username}! Hari ini cuaca di ${weather.city} terpantau cukup hangat (${temp}F, ${weather.condition}). Biar masak makin asyik dan segar di tenggorokan, Chef Bot menyarankan resep yang sejuk dan menyegarkan seperti Salad Buah Tropis Madu atau Es Kelapa Muda Jeruk. Apakah kakak ingin Chef pandu cara membuatnya?`;
    } else if (temp <= 66) {
      // Cold day greeting
      greetingText = `Halo Kak ${username}! Wih, udara di ${weather.city} sedang cukup dingin menusuk nih (${temp}F, ${weather.condition}). Paling pas dan mantap kalau kita memasak hidangan berkuah hangat yang kaya rempah seperti Soto Ayam Lamongan hangat atau Sup Ramen Pedas! Ingin Chef pandu langkah memasaknya untuk menghangatkan hari ini?`;
    } else {
      // Cool/Nice day greeting
      greetingText = `Halo Kak ${username}! Cuaca di ${weather.city} saat ini terpantau sangat sejuk dan bersahabat (${temp}F, ${weather.condition}). Suasana syahdu begini paling cocok untuk menikmati santapan lezat seperti Spaghetti Carbonara Creamy atau Pisang Goreng Keju Crispy hangat ditemani secangkir teh. Resep apa yang ingin kita ulik hari ini?`;
    }

    setMessages([
      {
        id: 'welcome',
        text: greetingText,
        sender: 'ai',
        timestamp: new Date(),
        isRichContent: true,
        richType: 'standard'
      }
    ]);
  }, [weather, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dialogue Response Tree
  const getChefResponse = (input: string): { text: string; richType: 'recipe' | 'steps' | 'substitution' | 'standard' } => {
    const query = input.toLowerCase();

    // 1. Weather Recommendation Trigger
    if (query.includes('resep') || query.includes('cuaca') || query.includes('rekomendasi') || query.includes('makan') || query.includes('menu')) {
      if (weather.temp >= 80) {
        return {
          text: `### Rekomendasi Menu Hari Hangat (${weather.temp}F)

**Menu Pilihan: Salad Buah Tropis Madu Mint**
* 🕒 **Waktu Pembuatan**: 15 Menit | 🟢 **Tingkat**: Sangat Mudah
* 🍎 **Bahan Utama**: Potongan mangga arumanis, melon, kiwi, strawberry, yogurt yunani, madu murni, daun mint segar.
* 💡 **Kenapa Cocok?**: Kandungan air yang tinggi dari buah-buahan segar membantu menjaga hidrasi tubuh Kakak di cuaca panas, ditambah kesegaran yogurt dingin yang memanjakan lidah!

Mau Chef pandu langkah-langkah detail pembuatannya sekarang?`,
          richType: 'recipe'
        };
      } else if (weather.temp <= 66) {
        return {
          text: `### Rekomendasi Menu Udara Dingin (${weather.temp}F)

**Menu Pilihan: Sup Ramen Pedas Kaldu Creamy**
* 🕒 **Waktu Pembuatan**: 30 Menit | 🔴 **Tingkat**: Sedang
* 🍜 **Bahan Utama**: Mi ramen basah, irisan daging sapi tipis (slice beef), telur rebus setengah matang (ajitsuke tamago), daun bawang, kuah kaldu miso pedas, minyak cabai (chili oil).
* 💡 **Kenapa Cocok?**: Kuah kaldu miso pedas berempah sangat efektif untuk menghangatkan suhu tubuh dan melegakan tenggorokan di udara yang dingin!

Tulis **"langkah"** jika Kakak ingin memulai proses memasak sup ramen pedas ini bersama Chef!`,
          richType: 'recipe'
        };
      } else {
        return {
          text: `### Rekomendasi Menu Cuaca Sejuk (${weather.temp}F)

**Menu Pilihan: Creamy Spaghetti Carbonara Masterpiece**
* 🕒 **Waktu Pembuatan**: 20 Menit | 🟡 **Tingkat**: Mudah
* **Bahan Utama**: Pasta spaghetti, smoked beef slice, keju parmesan parut, kuning telur segar, cooking cream, bawang putih cincang halus, mentega.
* 💡 **Kenapa Cocok?**: Cita rasa saus keju gurih creamy berpadu dengan kehangatan pasta segar sangat menyatu dengan angin sepoi sejuk hari ini!

Ketik **"langkah"** untuk langsung membuka panduan masak langkah demi langkah!`,
          richType: 'recipe'
        };
      }
    }

    // 2. Cooking Steps Trigger
    if (query.includes('langkah') || query.includes('pandu') || query.includes('cara') || query.includes('mulai') || query.includes('tahap')) {
      const selectedDish = weather.temp >= 80 ? 'Salad Buah Tropis' : weather.temp <= 66 ? 'Sup Ramen Pedas' : 'Spaghetti Carbonara';
      
      return {
        text: `### 🔪 Panduan Langkah Memasak: ${selectedDish}

Mari kita mulai masak bersama, Chef! Silakan ikuti instruksi berikut:

1. **Persiapan Bahan**: Cuci bersih semua bahan utama Kakak. Untuk sayur/buah potong ukuran sekali suap. Untuk mie/pasta, panaskan panci air.
2. **Proses Pengolahan**: 
   * *Jika Salad*: Campurkan dressing yogurt, madu, dan daun mint remas dalam mangkuk kecil hingga merata.
   * *Jika Ramen*: Rebus mi ramen selama 3 menit, tiriskan. Tumis irisan daging dengan minyak cabai hingga matang kecokelatan.
   * *Jika Carbonara*: Rebus spaghetti al-dente (9 menit). Di wajan terpisah, tumis smoked beef dengan mentega dan bawang putih.
3. **Finishing & Plating**: 
   * Siram dressing di atas buah dan sajikan dingin.
   * Tuang kaldu miso hangat di atas mi ramen, beri topping telur dan daun bawang.
   * Campurkan pasta panas langsung ke adonan telur-keju, aduk cepat hingga saus mengental mengkilap.

*Bagaimana Kakak? Apakah ada langkah yang kurang jelas atau perlu diulang?*`,
        richType: 'steps'
      };
    }

    // 3. Substitutions Trigger
    if (query.includes('bahan') || query.includes('ganti') || query.includes('substitusi') || query.includes('alternatif')) {
      return {
        text: `### 🧪 Substitusi Bahan Kreatif Pintar

Kehabisan bahan di dapur? Tenang Chef, ini alternatif cerdas yang tetap menghasilkan cita rasa lezat:

* **Cooking Cream / Susu Krim** - Ganti dengan **Susu Cair + Sedikit Mentega Cair** (untuk pasta) atau **Santan Kental** (untuk masakan lokal).
* **Keju Parmesan** - Ganti dengan **Keju Cheddar parut halus** yang dijemur sebentar agar teksturnya lebih kering.
* **Daging Sapi (Beef Slice)** - Ganti dengan **Irisan Dada Ayam**, **Jamur Tiram**, atau **Tahu Putih Sutra** yang gurih sehat!
* **Minyak Cabai (Chili Oil)** - Ganti dengan **Cabai Bubuk halus + Minyak Goreng hangat** yang diaduk rata.

Adakah bahan lain yang ingin Kakak tanyakan penggantinya? Tulis di bawah!`,
        richType: 'substitution'
      };
    }

    // 4. Default Interactive response
    return {
      text: `Pertanyaan yang bagus Kak!

Di tengah kondisi cuaca ${weather.temp}F saat ini, mengontrol suhu masakan adalah kunci utama. Jika Kakak ingin mengetahui lebih jauh, silakan gunakan menu cepat di atas atau tanyakan resep, langkah masak, maupun bahan pengganti yang sedang Kakak butuhkan di dapur. Chef selalu siap memandu!`,
      richType: 'standard'
    };
  };

  const handleSend = (textToSend: string = inputValue) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Dynamic Chef Response simulation
    setTimeout(() => {
      const chefResponse = getChefResponse(textToSend);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: chefResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        isRichContent: true,
        richType: chefResponse.richType
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const suggestions = [
    { label: "Resep Cuaca Hari Ini", icon: Sun, query: "resep rekomendasi cuaca hari ini" },
    { label: "Panduan Langkah Masak", icon: Utensils, query: "pandu langkah memasak detail" },
    { label: "Substitusi Bahan Kreatif", icon: Zap, query: "substitusi bahan makanan alternatif" }
  ];

  const cleanMessageText = (text: string) =>
    text
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
      .replace(/[ \t]{2,}/g, ' ');

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-hidden bg-transparent lg:px-8 lg:py-8 ${
      isDarkMode ? 'dark text-white' : 'text-slate-800'
    }`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 lg:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto h-screen flex flex-col lg:h-[calc(100vh-160px)] lg:max-w-6xl lg:flex-row lg:gap-6">
        <aside className="hidden lg:flex w-80 shrink-0 flex-col gap-5 rounded-[36px] border border-sky-100 bg-white p-6 shadow-sm">
          <button
            onClick={() => navigate('/smart-weather')}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 transition hover:bg-sky-100"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">Chef Assistant</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">AI masak yang lebih tenang.</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Tanya resep, substitusi bahan, atau panduan langkah memasak tanpa memenuhi layar dengan efek berat.
            </p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-sky-50/70 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                {weather.temp <= 66 ? <CloudRain className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-900">{weather.city}</p>
                <p className="text-2xl font-black text-sky-600">{weather.temp}F</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s.query)}
                className="flex w-full items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-left text-xs font-black text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
              >
                <s.icon className="h-4 w-4 text-sky-500" />
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:rounded-[36px] lg:border lg:border-sky-100 lg:bg-white lg:shadow-sm">
        
        {/* ================= HEADER ================= */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-sky-100/50 shadow-sm lg:px-7 lg:pt-6">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/smart-weather')}
              className="w-10 h-10 rounded-xl bg-white border border-sky-100 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-95 lg:hidden"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-sky-600" />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none">Chef AI Sous-Chef</h2>
                <div className="flex items-center gap-1 mt-1">
                  {weather.temp <= 66 ? (
                    <CloudRain className="w-3 h-3 text-sky-500" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                  <span className="text-[0px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    <span className="text-[9px]">{weather.city}: {weather.temp}F</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-slate-500 shadow-sm"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-sky-600" />}
          </motion.button>
        </header>

        {/* ================= MESSAGES AREA ================= */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar pb-36 lg:px-8 lg:pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[88%] p-4 rounded-[28px] shadow-sm relative overflow-hidden text-left border ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-tr from-sky-500 to-teal-600 text-white border-transparent rounded-tr-none' 
                    : isDarkMode
                      ? 'bg-slate-900/90 backdrop-blur-3xl text-slate-100 border-slate-800 rounded-tl-none'
                      : 'bg-white/90 backdrop-blur-3xl text-slate-800 border-sky-100/60 rounded-tl-none'
                }`}>
                  {msg.sender === 'ai' && (
                    <div className="absolute top-1 right-1 p-2 opacity-5 pointer-events-none">
                      <Bot className="w-10 h-10" />
                    </div>
                  )}

                  {/* Render Markdown-like content for visual excellence */}
                  {msg.isRichContent && msg.sender === 'ai' ? (
                    <div className="space-y-3 text-xs font-semibold leading-relaxed">
                      {cleanMessageText(msg.text).split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('###')) {
                          return (
                            <h3 key={index} className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 uppercase tracking-tight border-b border-sky-100/30 pb-1 mt-2">
                              {paragraph.replace('###', '').trim()}
                            </h3>
                          );
                        }
                        if (paragraph.startsWith('**Menu Pilihan:')) {
                          return (
                            <div key={index} className="bg-sky-50/50 border border-sky-100/50 p-3 rounded-2xl flex items-start gap-2.5 shadow-inner">
                              <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-800 block text-xs">
                                  {paragraph.trim()}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        if (paragraph.startsWith('* ')) {
                          return (
                            <ul key={index} className="space-y-1.5 pl-1">
                              {paragraph.split('\n').map((item, key) => (
                                <li key={key} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0 mt-1.5" />
                                  <span className="text-slate-600">{item.replace('*', '').trim()}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        if (paragraph.match(/^\d+\./)) {
                          return (
                            <ol key={index} className="space-y-2.5">
                              {paragraph.split('\n').map((step, key) => {
                                const match = step.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)/);
                                if (match) {
                                  return (
                                    <li key={key} className="bg-white border border-sky-100/40 p-3 rounded-2xl shadow-sm flex gap-3">
                                      <div className="w-6 h-6 bg-sky-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shrink-0">
                                        {match[1]}
                                      </div>
                                      <div>
                                        <span className="font-extrabold text-slate-800 block text-xs">{match[2]}</span>
                                        <span className="text-slate-500 block text-[11px] mt-0.5 leading-relaxed">{match[3]}</span>
                                      </div>
                                    </li>
                                  );
                                }
                                return (
                                  <li key={key} className="pl-4 text-slate-600">
                                    {step}
                                  </li>
                                );
                              })}
                            </ol>
                          );
                        }
                        return <p key={index} className="text-slate-600">{paragraph}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold leading-relaxed">{cleanMessageText(msg.text)}</p>
                  )}

                  <span className={`text-[8px] font-bold uppercase mt-2.5 block opacity-40 ${
                    msg.sender === 'user' ? 'text-right text-sky-100' : 'text-left text-slate-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/80 border border-sky-100/50 p-4 rounded-[28px] rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-sky-600 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* ================= SUGGESTIONS FOOT PANEL ================= */}
        <div className="absolute bottom-28 inset-x-0 px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar z-20 lg:hidden">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend(s.query)}
              className="px-4 py-2.5 bg-white border border-sky-100/80 rounded-full text-[10px] font-black text-slate-600 shadow-md flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95 transition-all"
            >
              <s.icon className="w-4 h-4 text-sky-500" />
              {s.label}
            </motion.button>
          ))}
        </div>

        {/* ================= INPUT CHAT AREA ================= */}
        <footer className="absolute bottom-6 inset-x-0 px-6 z-20 lg:px-8">
          <div className="bg-white border border-sky-100/80 rounded-[32px] p-2 flex items-center gap-2 shadow-xl ring-1 ring-sky-100/50">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya Chef AI Sous-Chef..."
              className="flex-1 bg-transparent px-4 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-350 focus:outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 active:scale-95 shrink-0"
              title="Kirim pesan"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </footer>

        </div>
      </div>
    </div>
  );
}
