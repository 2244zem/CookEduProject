import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Bookmark, Play, Plus, Search, 
  ArrowLeft, Send, Star, X, Sparkles, Image, Video, Compass, UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Premium background & photographic assets
import bgImage from '../../assets/background/#MyStyle25.jpg';
import bgDrop from '../../assets/background/Random but Beautiful.jpg';
import foodPattern from '../../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg';
import img1 from '../../assets/download (1).jpg';
import img2 from '../../assets/download (2).jpg';
import img3 from '../../assets/download (3).jpg';

interface PostComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

interface CookPost {
  id: string;
  user: string;
  avatar: string;
  role: string;
  time: string;
  title: string;
  category: string;
  image: string;
  videoUrl?: string;
  likes: number;
  liked: boolean;
  comments: PostComment[];
  shares: number;
  rating: number;
  bookmarked: boolean;
  description: string;
}

export default function CookShare() {
  const navigate = useNavigate();
  const { user: realUser } = useAuthStore();
  
  const activeUserAvatar = realUser?.avatar_url || realUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${realUser?.name || 'zem'}&backgroundColor=b6e3f4`;
  const activeUserName = realUser?.name || 'zem';
  const activeUserRole = realUser?.role === 'admin' ? 'Super Administrator' : 'Apprentice Chef';

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real-time dynamic posts catalog
  const [posts, setPosts] = useState<CookPost[]>([]);
  
  // Interactive Modal/Drawer states
  const [selectedPostForComments, setSelectedPostForComments] = useState<CookPost | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Dessert");
  const [newPostImageIndex, setNewPostImageIndex] = useState<number>(0);
  const [newPostVideo, setNewPostVideo] = useState("");
  const [newPostDesc, setNewPostDesc] = useState("");
  
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Preset images map utilizing user's three photographic assets
  const PRESET_IMAGES = [img1, img2, img3];

  // Initialize with travelingg reference-inspired gastronomic data
  useEffect(() => {
    setPosts([
      {
        id: "post_1",
        user: "Julie Echeverri",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        role: "Chef de Cuisine",
        time: "4 jam yang lalu",
        title: "Seni Rahasia Plating French Mille-Feuille Dessert",
        category: "Dessert",
        image: img1,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Simulated high-end video
        likes: 50200,
        liked: false,
        comments: [
          { id: "c_1", user: "Zem Special", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", text: "Teknik melipat puff pastry ini sangat presisi! Terlihat sangat mahal.", time: "2 jam lalu" },
          { id: "c_2", user: "Mama Chef", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", text: "Cantik sekali! Langsung saya masukkan resep favorit minggu ini.", time: "1 jam lalu" }
        ],
        shares: 322,
        rating: 4.9,
        bookmarked: false,
        description: "Mille-feuille klasik terdiri dari tiga lapis puff pastry bergantian dengan dua lapis pastry cream. Kami menyempurnakannya dengan buah beri segar dan lapisan kaca gula tipis."
      },
      {
        id: "post_2",
        user: "Richard V. Moe",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        role: "Spice Enthusiast",
        time: "2 hari yang lalu",
        title: "Sup & Soto Rempah Nusantara: Warisan Kuliner Kaya Rasa",
        category: "Soup",
        image: img2,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        likes: 128500,
        liked: true,
        comments: [
          { id: "c_3", user: "Ahmad Soto", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", text: "Kuahnya berkaldu pekat dan sangat harum kapulaga!", time: "1 hari lalu" }
        ],
        shares: 936,
        rating: 4.8,
        bookmarked: true,
        description: "Menjelajahi teknik kalibrasi api kecil (slow simmering) untuk menghasilkan sari kaldu sumsum sapi pekat yang dikombinasikan dengan 12 macam rempah basah Nusantara."
      },
      {
        id: "post_3",
        user: "Nadia Syifa",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        role: "Main Course Designer",
        time: "3 hari yang lalu",
        title: "Simfoni Gastronomi Global: Spaghetti Carbonara Sejati",
        category: "Main Course",
        image: img3,
        likes: 8520,
        liked: false,
        comments: [],
        shares: 112,
        rating: 4.7,
        bookmarked: false,
        description: "Tanpa heavy cream! Menggunakan emulsi keju Pecorino Romano asli, kuning telur segar, dan lemak gurih Guanciale panggang yang renyah."
      }
    ]);
  }, []);

  // Likes toggle handler with pulsing animation
  const handleLikeToggle = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  // Bookmark toggle handler
  const handleBookmarkToggle = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, bookmarked: !p.bookmarked };
      }
      return p;
    }));
  };

  // Write new comment to post
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPostForComments) return;

    const newComment: PostComment = {
      id: `comm_${Date.now()}`,
      user: activeUserName,
      avatar: activeUserAvatar,
      text: newCommentText,
      time: "Baru saja"
    };

    const updatedPosts = posts.map(p => {
      if (p.id === selectedPostForComments.id) {
        const updatedComments = [...p.comments, newComment];
        // Keep active drawer in sync
        setSelectedPostForComments({ ...p, comments: updatedComments });
        return { ...p, comments: updatedComments };
      }
      return p;
    });

    setPosts(updatedPosts);
    setNewCommentText("");
  };

  // Create and publish new custom post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost: CookPost = {
      id: `post_${Date.now()}`,
      user: activeUserName,
      avatar: activeUserAvatar,
      role: activeUserRole,
      time: "Baru saja",
      title: newPostTitle,
      category: newPostCategory,
      image: PRESET_IMAGES[newPostImageIndex],
      videoUrl: newPostVideo.trim() ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : undefined,
      likes: 1,
      liked: true,
      comments: [],
      shares: 0,
      rating: 5.0,
      bookmarked: false,
      description: newPostDesc || `Formula hidangan lezat dikreasikan oleh ${activeUserName}.`
    };

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    
    // Reset form states
    setNewPostTitle("");
    setNewPostDesc("");
    setNewPostVideo("");
  };

  // Format big numbers like travelingg reference
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  // Filter posts based on search query & category tabs
  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-hidden flex justify-center pb-24 select-none">
      
      {/* ================= GLOBAL DEEP-BLUE OCEAN PARALLAX BACKDROP ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1. Deep ocean fluid wallpaper */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* 2. Ethereal pulsing marine sun-rays light */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse"
          style={{ backgroundImage: `url(${bgDrop})`, animationDuration: '14s' }}
        />
        {/* 3. Textured culinary line grid */}
        <div 
          className="absolute inset-0 bg-repeat opacity-[0.025]"
          style={{ backgroundImage: `url(${foodPattern})`, backgroundSize: '360px' }}
        />
        {/* 4. Deep sea ambient color highlights */}
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-sky-900/40 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-teal-900/30 blur-[130px] rounded-full" />
      </div>

      {/* ================= VIEWPORT MAIN WRAPPER CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-md p-4 flex flex-col space-y-6">
        
        {/* ================= TRAVELINGG-INSPIRED HEADER PANEL ================= */}
        <header className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border border-sky-350/20 p-4 rounded-3xl shadow-lg shrink-0">
          <div className="flex items-center gap-3 text-left">
            <button 
              onClick={() => navigate('/smart-weather')} 
              className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex items-center justify-center text-white active:scale-95 transition-all"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-sky-300 to-teal-200 bg-clip-text text-transparent">cookshare</h1>
              <span className="text-[8px] font-black uppercase text-sky-300 tracking-widest block leading-none mt-0.5">Social Food Feed</span>
            </div>
          </div>

          <div className="w-10 h-10 bg-gradient-to-tr from-sky-400 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-5 h-5 animate-spin-slow text-white" />
          </div>
        </header>

        {/* ================= SEARCH INPUT ================= */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-200/60 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari kreasi menu, chef, soto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-sky-350/20 rounded-2xl text-xs font-semibold focus:outline-none focus:border-sky-400 focus:bg-slate-950/80 transition-all text-white placeholder:text-sky-200/40 shadow-inner h-12"
          />
        </div>

        {/* ================= HORIZONTAL CATEGORIES SLIDER ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar select-none text-left">
          {["Semua", "Dessert", "Soup", "Main Course"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-2 px-4 rounded-full text-[10px] font-black tracking-wider uppercase shrink-0 transition-all active:scale-95 border ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-sky-500 to-teal-500 border-sky-400 text-white shadow-md shadow-sky-500/10"
                  : "bg-slate-950/40 hover:bg-slate-950/70 border-sky-350/10 text-sky-200/70"
              }`}
            >
              {cat === "Semua" ? "🔥 Semua" : cat === "Soup" ? "🍵 Sup & Soto" : cat === "Dessert" ? "🍰 Dessert" : "🍳 Main Course"}
            </button>
          ))}
        </div>

        {/* ================= FEED CARDS CATALOG ================= */}
        <main className="space-y-6 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5 no-scrollbar pb-16">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="group relative bg-slate-950/45 backdrop-blur-xl border border-sky-300/15 rounded-[2.5rem] p-4.5 flex flex-col justify-between hover:shadow-2xl hover:shadow-sky-500/[0.03] hover:border-sky-300/30 transition-all duration-500 shadow-xl overflow-hidden text-left"
              >
                
                {/* 1. Header: Contributor Credentials */}
                <div className="flex items-center justify-between mb-3.5 z-10">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={post.avatar} 
                      alt={post.user} 
                      className="w-10 h-10 rounded-full border border-sky-300/30 object-cover bg-slate-800"
                    />
                    <div className="text-left leading-tight">
                      <h4 className="text-xs font-black text-white flex items-center gap-1">
                        {post.user}
                        {post.user === "zem" && <UserCheck className="w-3 h-3 text-sky-400" />}
                      </h4>
                      <span className="text-[9px] font-bold text-sky-200/50 uppercase tracking-wide block mt-0.5">
                        {post.role} • {post.time}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBookmarkToggle(post.id)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                  >
                    <Bookmark 
                      className={`w-4 h-4 transition-all ${
                        post.bookmarked ? 'fill-sky-400 text-sky-400 stroke-[2.5]' : 'text-slate-300 hover:text-white'
                      }`} 
                    />
                  </button>
                </div>

                {/* 2. Visual Media Container with Zoom */}
                <div className="relative w-full h-56 rounded-[2rem] overflow-hidden border border-white/10 shadow-inner group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Rating Badge Overlay */}
                  <div className="absolute top-3.5 right-3.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-black text-white">{post.rating}</span>
                  </div>

                  {/* Pulsing Video Play Button Overlay */}
                  {post.videoUrl && (
                    <button 
                      onClick={() => setActiveVideoUrl(post.videoUrl || null)}
                      className="absolute inset-0 m-auto w-14 h-14 bg-sky-500/85 hover:bg-sky-400/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all group/play border border-white/20"
                      aria-label="Putar Video Preview"
                    >
                      <div className="absolute inset-0 bg-sky-400/30 rounded-full animate-ping pointer-events-none" />
                      <Play className="w-6 h-6 fill-current text-white translate-x-0.5 group-hover/play:scale-110 transition-transform" />
                    </button>
                  )}

                  {/* Category Pill Overlay */}
                  <div className="absolute bottom-3.5 left-3.5">
                    <span className="text-[8px] font-black bg-sky-500/90 text-white border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* 3. Description Block */}
                <div className="mt-4 space-y-1.5 px-1 text-left z-10">
                  <h3 className="font-extrabold text-sm text-white leading-snug tracking-tight group-hover:text-sky-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[11px] font-medium text-sky-100/70 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>

                {/* 4. Sleek Interaction Capsule Footer Bar */}
                <div className="mt-4 pt-3.5 border-t border-sky-300/10 flex justify-between items-center z-10">
                  <div className="bg-white border border-white/10 rounded-full py-1.5 px-4 flex items-center gap-4.5 shadow-md shadow-slate-950/20">
                    
                    {/* Like button */}
                    <button 
                      onClick={() => handleLikeToggle(post.id)}
                      className="flex items-center gap-1.5 active:scale-90 transition-transform"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          post.liked 
                            ? 'fill-rose-500 text-rose-500 animate-pulse stroke-[2.5]' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`} 
                      />
                      <span className="text-[10px] font-black text-slate-700">{formatNumber(post.likes)}</span>
                    </button>

                    {/* Comment button */}
                    <button 
                      onClick={() => setSelectedPostForComments(post)}
                      className="flex items-center gap-1.5 active:scale-90 transition-transform"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                      <span className="text-[10px] font-black text-slate-700">{post.comments.length}</span>
                    </button>

                    {/* Share button */}
                    <button 
                      onClick={() => alert("Karya berhasil dibagikan!")}
                      className="flex items-center gap-1.5 active:scale-90 transition-transform"
                    >
                      <Share2 className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                      <span className="text-[10px] font-black text-slate-700">{formatNumber(post.shares)}</span>
                    </button>

                  </div>

                  <span className="text-[9px] font-black text-sky-300/80 uppercase tracking-widest bg-sky-950/50 border border-sky-850/40 px-2.5 py-1 rounded-xl">
                    View Recipe
                  </span>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty feed state */}
          {filteredPosts.length === 0 && (
            <div className="bg-slate-950/40 border border-sky-300/10 rounded-3xl p-10 text-center text-sky-200/50 space-y-3 backdrop-blur-md">
              <div className="w-12 h-12 bg-sky-950/50 border border-sky-800 rounded-full flex items-center justify-center mx-auto text-sky-400">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-black">Belum ada karya untuk kategori ini</p>
            </div>
          )}
        </main>

        {/* ================= FLOATING ACTION BUTTON: SHARE MASTERPIECE ================= */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 md:right-auto md:left-[calc(50%+130px)] z-40 bg-gradient-to-tr from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-full p-4.5 shadow-2xl flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          title="Share Preview Karya Anda"
          aria-label="Bagikan Karya"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>

      {/* ================= BOTTOM SHEET DRAWER: COMMENT SECTION (Thumb-Zone Rule) ================= */}
      <AnimatePresence>
        {selectedPostForComments && (
          <div className="fixed inset-0 z-[120] flex flex-col justify-end">
            
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPostForComments(null)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            {/* Bottom Sheet Body */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              className="relative w-full max-w-md mx-auto bg-[#071324]/95 border-t border-sky-300/30 rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[75vh] z-10 overflow-hidden text-left"
            >
              {/* Drag Pill Handle */}
              <div 
                onClick={() => setSelectedPostForComments(null)}
                className="w-12 h-1.5 bg-sky-200/20 rounded-full mx-auto my-3 cursor-pointer shrink-0" 
              />

              {/* Title Header */}
              <div className="px-5 pb-3.5 border-b border-sky-300/10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Diskusi Masakan</h3>
                  <span className="text-[9px] font-bold text-sky-200/50 uppercase tracking-wider block mt-0.5">
                    {selectedPostForComments.comments.length} Komentar Aktif
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedPostForComments(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Scrollable area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {selectedPostForComments.comments.length === 0 ? (
                  <div className="py-10 text-center text-sky-200/40 text-xs">
                    Belum ada diskusi. Jadilah orang pertama yang mengapresiasi karya zem!
                  </div>
                ) : (
                  selectedPostForComments.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <img 
                        src={c.avatar} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-800 border border-white/10"
                      />
                      <div className="text-left flex-1 leading-tight">
                        <div className="flex justify-between items-baseline">
                          <span className="font-black text-xs text-white">{c.user}</span>
                          <span className="text-[8px] font-bold text-sky-200/40 uppercase">{c.time}</span>
                        </div>
                        <p className="text-[11px] text-sky-100/80 leading-relaxed mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dynamic Comment Input Form */}
              <form onSubmit={handleAddComment} className="p-4 bg-slate-950/70 border-t border-sky-350/15 flex items-center gap-3 shrink-0">
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Ketik komentar masakan..." 
                  className="flex-1 bg-white/5 border border-sky-350/15 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-sky-400 text-white placeholder:text-sky-200/35 h-11"
                />
                <button 
                  type="submit"
                  className="w-11 h-11 bg-sky-500 hover:bg-sky-600 rounded-xl flex items-center justify-center text-white active:scale-95 transition-colors"
                >
                  <Send className="w-4.5 h-4.5 translate-x-[-0.5px]" />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: SHARE MASTERPIECE (Create custom Post) ================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#071324]/95 border border-sky-300/30 rounded-[2.5rem] shadow-2xl p-6 z-10 overflow-hidden text-left"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-sky-300/10 mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Bagikan Mahakarya</span>
                  </h3>
                  <p className="text-[8px] font-bold text-sky-200/50 uppercase tracking-widest mt-0.5">
                    Unggah Formula Kuliner & Preview Video Anda
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handlePublishPost} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-sky-200/50 tracking-wider">Judul Kreasi</label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Contoh: Soto Betawi Susu zem123"
                    className="w-full bg-white/5 border border-sky-350/15 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-sky-400 h-11"
                  />
                </div>

                {/* Category & Preset Picture Select */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-sky-200/50 tracking-wider">Kategori</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full bg-white/5 border border-sky-350/15 rounded-xl px-2.5 py-3 text-xs font-semibold text-white focus:outline-none focus:border-sky-400 h-11"
                    >
                      <option className="bg-[#071324] text-white" value="Dessert">Dessert</option>
                      <option className="bg-[#071324] text-white" value="Soup">Sup & Soto</option>
                      <option className="bg-[#071324] text-white" value="Main Course">Main Course</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-sky-200/50 tracking-wider">Video Link</label>
                    <input
                      type="url"
                      value={newPostVideo}
                      onChange={(e) => setNewPostVideo(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-white/5 border border-sky-350/15 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-sky-400 h-11"
                    />
                  </div>
                </div>

                {/* Select Preset Photographic Asset (Strictly No slop, utilizing user pictures!) */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-sky-200/50 tracking-wider flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-sky-400" />
                    <span>Pilih Foto Mahakarya (Preset)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setNewPostImageIndex(index)}
                        className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          newPostImageIndex === index ? "border-sky-400 scale-[1.03] ring-1 ring-sky-300" : "border-transparent opacity-60"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Text */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-sky-200/50 tracking-wider">Deskripsi Karya</label>
                  <textarea
                    value={newPostDesc}
                    onChange={(e) => setNewPostDesc(e.target.value)}
                    placeholder="Tuliskan cerita dibalik hidangan lezat ini..."
                    rows={2}
                    className="w-full bg-white/5 border border-sky-350/15 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-650 hover:to-teal-650 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md active:scale-95 transition-all"
                >
                  Terbitkan Karya 🚀
                </button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH-END GLASSMORPHIC INLINE VIDEO STREAM OVERLAY ================= */}
      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            
            {/* Backdrop blur layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoUrl(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Video Frame */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-black rounded-[2.5rem] border border-sky-300/30 overflow-hidden shadow-2xl aspect-video z-10"
            >
              <iframe
                src={activeVideoUrl}
                title="Preview Video Karya"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
              
              {/* Close float button */}
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center active:scale-90 transition-all"
                aria-label="Tutup Video"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
