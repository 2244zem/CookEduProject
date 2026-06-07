import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Bookmark,
  ChefHat,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'
import {
  createSocialComment,
  createSocialPost,
  listSocialPosts,
  subscribeToCookEduRealtime,
  toggleFavoriteItem,
  toggleSocialPostLike,
  type SocialCategory,
  type SocialPostView,
} from '../../lib/supabaseData'

const SOCIAL_CATEGORIES: SocialCategory[] = [
  'Cooking Technique',
  'Plating Art',
  'Baking Science',
  'Kitchen Hacks',
  'Recipe Story',
  'Ingredient Guide',
]

const categoryTone: Record<string, string> = {
  'Cooking Technique': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Plating Art': 'bg-rose-50 text-rose-700 border-rose-100',
  'Baking Science': 'bg-amber-50 text-amber-700 border-amber-100',
  'Kitchen Hacks': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Recipe Story': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Ingredient Guide': 'bg-slate-100 text-slate-700 border-slate-200',
}

function formatTime(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function compactCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

function SocialMedia({ post }: { post: SocialPostView }) {
  const src = resolveMediaUrl(post.media_url)

  if (post.media_type === 'video') {
    return (
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <img
      src={src || avatarFallbackUrl(post.title)}
      alt={post.title}
      loading="lazy"
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />
  )
}

function PostCard({
  post,
  onLike,
  onFavorite,
  onOpenComments,
  isBusy,
}: {
  post: SocialPostView
  onLike: (post: SocialPostView) => void
  onFavorite: (post: SocialPostView) => void
  onOpenComments: (post: SocialPostView) => void
  isBusy: boolean
}) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <SocialMedia post={post} />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${categoryTone[post.category] || categoryTone['Ingredient Guide']}`}>
          {post.category}
        </span>
        <button
          onClick={() => onFavorite(post)}
          disabled={isBusy}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-60"
          title="Simpan favorit"
        >
          <Bookmark className={`h-5 w-5 ${post.favorited_by_user ? 'fill-cyan-600 text-cyan-600' : ''}`} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <img
            src={post.author_avatar_url}
            alt={post.author_name}
            className="h-11 w-11 rounded-2xl object-cover"
          />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-black text-slate-950">{post.author_name}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {post.author_role} | {formatTime(post.created_at)}
            </p>
          </div>
        </div>

        <div className="text-left">
          <h2 className="text-xl font-black leading-tight tracking-tight text-slate-950">{post.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{post.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLike(post)}
              disabled={isBusy}
              className={`flex h-10 items-center gap-2 rounded-2xl px-3 text-sm font-black transition disabled:opacity-60 ${
                post.liked_by_user ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
              {compactCount(post.likes_count)}
            </button>
            <button
              onClick={() => onOpenComments(post)}
              className="flex h-10 items-center gap-2 rounded-2xl bg-slate-50 px-3 text-sm font-black text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              <MessageCircle className="h-4 w-4" />
              {compactCount(post.comments_count)}
            </button>
          </div>

          <button
            onClick={() => onOpenComments(post)}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700"
          >
            Diskusi
          </button>
        </div>
      </div>
    </article>
  )
}

function Composer({
  compact = false,
  onClose,
}: {
  compact?: boolean
  onClose?: () => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SocialCategory>('Cooking Technique')
  const [description, setDescription] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: () => {
      if (!mediaFile) throw new Error('Upload foto atau video wajib diisi.')
      return createSocialPost({
        title,
        category,
        description,
        mediaFile,
        onProgress: setProgress,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      setTitle('')
      setDescription('')
      setMediaFile(null)
      setProgress(0)
      setError('')
      onClose?.()
    },
    onError: (err: any) => {
      setError(err?.message || 'Gagal menerbitkan post.')
      setProgress(0)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!title.trim()) return setError('Judul post wajib diisi.')
    if (!description.trim()) return setError('Deskripsi wajib diisi.')
    if (!mediaFile) return setError('Pilih foto atau video dari perangkat.')
    createMutation.mutate()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[28px] border border-slate-200 bg-white p-5 pb-safe-bottom shadow-sm ${compact ? '' : 'sticky top-28'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Creator Console</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Publish culinary insight</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-left">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Contoh: Teknik sear steak agar crust merata"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-cyan-400 focus:bg-white"
          />
        </label>

        <label className="block text-left">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as SocialCategory)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            {SOCIAL_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block text-left">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="Tulis instruksi, tips, trik plating, atau catatan eksperimen dapur..."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-950 outline-none transition focus:border-cyan-400 focus:bg-white"
          />
        </label>

        <label className="block cursor-pointer rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-50">
          <input
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              {mediaFile?.type.startsWith('video/') ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{mediaFile?.name || 'Upload foto atau video HD'}</p>
              <p className="text-xs font-semibold text-slate-500">File lokal langsung dikirim ke Supabase Storage.</p>
            </div>
          </div>
        </label>

        {progress > 0 && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-cyan-700 disabled:opacity-60 ${compact ? 'sticky bottom-0 z-10' : ''}`}
        >
          {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-white" />}
          {createMutation.isPending ? 'Uploading...' : 'Publish Post'}
        </button>
      </div>
    </form>
  )
}

function CommentsDrawer({
  post,
  onClose,
}: {
  post: SocialPostView
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const commentMutation = useMutation({
    mutationFn: () => createSocialComment({
      postId: post.id,
      content,
      attachmentFile,
      onProgress: setProgress,
    }),
    onSuccess: () => {
      setContent('')
      setAttachmentFile(null)
      setProgress(0)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    },
    onError: (err: any) => {
      setError(err?.message || 'Gagal mengirim komentar.')
      setProgress(0)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!content.trim()) return setError('Komentar tidak boleh kosong.')
    commentMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center lg:items-center">
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        aria-label="Tutup komentar"
      />
      <motion.section
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[32px] border border-slate-200 bg-white shadow-2xl lg:rounded-[32px]"
      >
        <header className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Thread</p>
            <h2 className="line-clamp-1 text-xl font-black text-slate-950">{post.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {post.comments.length ? post.comments.map((comment) => (
            <article key={comment.id} className={`flex gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 ${comment.parent_id ? 'ml-8' : ''}`}>
              <img src={comment.author_avatar_url} alt={comment.author_name} className="h-10 w-10 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-black text-slate-950">{comment.author_name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{formatTime(comment.created_at)}</p>
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{comment.content}</p>
                {comment.attachment_url && (
                  <a href={comment.attachment_url} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img src={comment.attachment_url} alt="Lampiran komentar" className="max-h-64 w-full object-cover" />
                  </a>
                )}
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-black text-slate-500">Belum ada komentar.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-100 p-4 pb-safe-bottom">
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
          {progress > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-cyan-700">
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
              <Paperclip className="h-5 w-5" />
            </label>
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={attachmentFile ? `Lampiran: ${attachmentFile.name}` : 'Tulis komentar atau tips tambahan...'}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-cyan-400 focus:bg-white"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {commentMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  )
}

export default function SocialHub() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | SocialCategory>('All')
  const [showMobileComposer, setShowMobileComposer] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [socialActionError, setSocialActionError] = useState('')

  const displayName = user?.name || user?.username || 'Koki CookEdu'
  const avatarUrl = resolveMediaUrl(user?.avatar_url || user?.avatar) || avatarFallbackUrl(displayName)

  const postsQuery = useQuery({
    queryKey: ['social-posts'],
    queryFn: listSocialPosts,
  })

  useEffect(() => {
    return subscribeToCookEduRealtime(() => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
    })
  }, [queryClient])

  const likeMutation = useMutation({
    mutationFn: (post: SocialPostView) => toggleSocialPostLike(post.id),
    onMutate: () => setSocialActionError(''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-posts'] }),
    onError: (err: any) => setSocialActionError(err?.message || 'Like gagal diproses. Silakan login ulang jika sesi habis.'),
  })

  const favoriteMutation = useMutation({
    mutationFn: (post: SocialPostView) => toggleFavoriteItem(post.id, 'post'),
    onMutate: () => setSocialActionError(''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
    },
    onError: (err: any) => setSocialActionError(err?.message || 'Favorit gagal diproses. Silakan login ulang jika sesi habis.'),
  })

  const posts = postsQuery.data || []
  const selectedPost = selectedPostId ? posts.find((post) => post.id === selectedPostId) || null : null
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory
      const matchesSearch = !query || [post.title, post.description, post.author_name, post.category]
        .some((value) => value.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, posts, searchQuery])

  const busyPostId = likeMutation.variables?.id || favoriteMutation.variables?.id

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8 lg:py-8">
        <aside className="hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt={displayName} className="h-12 w-12 rounded-2xl object-cover" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Culinary Social Hub</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {(['All', ...SOCIAL_CATEGORIES] as Array<'All' | SocialCategory>).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex h-12 w-full items-center justify-between rounded-2xl px-4 text-left text-sm font-black transition ${
                  activeCategory === category ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                }`}
              >
                <span className="truncate">{category === 'All' ? 'All Posts' : category}</span>
                <span className="h-2 w-2 rounded-full bg-current opacity-40" />
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live creator feed
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Halo, {displayName}. Share what works in your kitchen.
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
                  Upload teknik, plating, eksperimen baking, dan trik dapur dengan media asli dari perangkatmu.
                </p>
              </div>
              <button
                onClick={() => setShowMobileComposer(true)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black uppercase tracking-widest text-white shadow-sm lg:hidden"
              >
                <Plus className="h-5 w-5 text-cyan-300" />
                Post
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-700" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search technique, plating, creator, category..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto md:max-w-md">
                {(['All', ...SOCIAL_CATEGORIES] as Array<'All' | SocialCategory>).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`h-11 shrink-0 rounded-2xl px-4 text-xs font-black transition lg:hidden ${
                      activeCategory === category ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {category === 'All' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {socialActionError && (
            <div className="flex items-start gap-3 rounded-[24px] border border-rose-100 bg-rose-50 px-5 py-4 text-left text-sm font-bold text-rose-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{socialActionError}</span>
            </div>
          )}

          {postsQuery.isError ? (
            <div className="rounded-[30px] border border-amber-200 bg-amber-50 p-8 text-left">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">Social Hub belum tersambung ke Supabase.</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Jalankan file supabase_social_hub_schema.sql di Supabase SQL Editor, lalu refresh halaman ini.
                  </p>
                </div>
              </div>
            </div>
          ) : postsQuery.isLoading ? (
            <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
              <ChefHat className="mx-auto h-12 w-12 animate-pulse text-cyan-700" />
              <p className="mt-3 text-sm font-black text-slate-500">Loading social feed...</p>
            </div>
          ) : filteredPosts.length ? (
            <section className="grid gap-5 xl:grid-cols-2">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(item) => likeMutation.mutate(item)}
                  onFavorite={(item) => favoriteMutation.mutate(item)}
                  onOpenComments={(item) => setSelectedPostId(item.id)}
                  isBusy={busyPostId === post.id}
                />
              ))}
            </section>
          ) : (
            <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-base font-black text-slate-600">Belum ada post untuk filter ini.</p>
              <p className="mt-1 text-sm font-semibold text-slate-400">Jadilah creator pertama yang mengisi kategori ini.</p>
            </div>
          )}
        </main>

        <aside className="hidden lg:block">
          <Composer />
        </aside>
      </div>

      <AnimatePresence>
        {showMobileComposer && (
          <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/60 p-3 pb-safe-bottom backdrop-blur-sm sm:p-4">
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[28px]"
            >
              <Composer compact onClose={() => setShowMobileComposer(false)} />
            </motion.div>
          </div>
        )}
        {selectedPost && <CommentsDrawer post={selectedPost} onClose={() => setSelectedPostId(null)} />}
      </AnimatePresence>
    </div>
  )
}
