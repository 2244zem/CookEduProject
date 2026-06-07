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
} from '@icons/CookEduIcons'
import { useAuthStore } from '../../store/authStore'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'
import { getPreferredIdentityName } from '../../lib/supabaseClient'
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
import { useToastStore } from '../../store/toastStore'

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

const MAX_PHOTO_FILES = 6
const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 45 * 1024 * 1024
const MAX_VIDEO_DURATION = 90

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(bytes > 20 * 1024 * 1024 ? 0 : 1)}MB`
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}

function readVideoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration || 0)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Durasi video tidak bisa dibaca. Coba pakai file MP4/WebM yang valid.'))
    }
    video.src = url
  })
}

async function validateSocialFiles(files: File[]) {
  if (!files.length) return []
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))
  const videoFiles = files.filter((file) => file.type.startsWith('video/'))
  const invalidFile = files.find((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'))

  if (invalidFile) throw new Error('File harus berupa foto atau video.')
  if (videoFiles.length && files.length > 1) throw new Error('Video hanya bisa diupload satu file per post. Untuk tips bertahap, gunakan beberapa foto.')
  if (imageFiles.length > MAX_PHOTO_FILES) throw new Error(`Maksimal ${MAX_PHOTO_FILES} foto dalam satu post tips.`)

  for (const file of imageFiles) {
    if (file.size > MAX_PHOTO_SIZE) {
      throw new Error(`Foto "${file.name}" terlalu besar. Maksimal ${formatBytes(MAX_PHOTO_SIZE)} per foto.`)
    }
  }

  if (videoFiles[0]) {
    const video = videoFiles[0]
    if (video.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video terlalu besar. Maksimal ${formatBytes(MAX_VIDEO_SIZE)} agar stabil di Supabase.`)
    }
    const duration = await readVideoDuration(video)
    if (duration > MAX_VIDEO_DURATION) {
      throw new Error(`Video terlalu panjang. Maksimal ${MAX_VIDEO_DURATION} detik, video ini sekitar ${Math.round(duration)} detik.`)
    }
  }

  return files
}

function SocialMedia({
  post,
  detail = false,
}: {
  post: SocialPostView
  detail?: boolean
}) {
  const assets = post.media_assets?.length
    ? post.media_assets
    : [{ url: resolveMediaUrl(post.media_url), type: post.media_type, path: post.media_url }]
  const primary = assets[0]
  const src = resolveMediaUrl(primary?.url)

  if (primary?.type === 'video') {
    return (
      <video
        src={src}
        controls={detail}
        muted={!detail}
        playsInline
        preload="metadata"
        className={`h-full w-full ${detail ? 'object-contain bg-slate-950' : 'object-cover'}`}
      />
    )
  }

  if (detail && assets.length > 1) {
    return (
      <div className="grid h-full gap-3 overflow-y-auto bg-slate-950 p-3 sm:grid-cols-2">
        {assets.map((asset, index) => (
          <img
            key={`${asset.path}-${index}`}
            src={resolveMediaUrl(asset.url) || avatarFallbackUrl(post.title)}
            alt={`${post.title} ${index + 1}`}
            loading="lazy"
            className="min-h-56 w-full rounded-2xl bg-white/5 object-contain"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <img
        src={src || avatarFallbackUrl(post.title)}
        alt={post.title}
        loading="lazy"
        className={`h-full w-full ${detail ? 'object-contain bg-slate-950' : 'object-cover transition duration-700 group-hover:scale-105'}`}
      />
      {!detail && assets.length > 1 && (
        <span className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
          {assets.length} foto
        </span>
      )}
    </div>
  )
}

function PostCard({
  post,
  onLike,
  onFavorite,
  onOpenDetail,
  isBusy,
}: {
  post: SocialPostView
  onLike: (post: SocialPostView) => void
  onFavorite: (post: SocialPostView) => void
  onOpenDetail: (post: SocialPostView) => void
  isBusy: boolean
}) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={() => onOpenDetail(post)}
          className="block h-full w-full text-left"
        >
          <SocialMedia post={post} />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${categoryTone[post.category] || categoryTone['Ingredient Guide']}`}>
            {post.category}
          </span>
          {post.media_type === 'video' && (
            <span className="absolute bottom-4 left-4 rounded-2xl bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              Tap untuk detail video
            </span>
          )}
        </button>
        <button
          onClick={() => onFavorite(post)}
          disabled={isBusy}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-60"
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
          <button type="button" onClick={() => onOpenDetail(post)} className="block text-left">
            <h2 className="text-xl font-black leading-tight tracking-tight text-slate-950 transition hover:text-cyan-700">{post.title}</h2>
          </button>
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
              onClick={() => onOpenDetail(post)}
              className="flex h-10 items-center gap-2 rounded-2xl bg-slate-50 px-3 text-sm font-black text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              <MessageCircle className="h-4 w-4" />
              {compactCount(post.comments_count)}
            </button>
          </div>

          <button
            onClick={() => onOpenDetail(post)}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700"
          >
            Detail
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
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const pushToast = useToastStore((state) => state.pushToast)
  const previewItems = useMemo(() => mediaFiles.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  })), [mediaFiles])

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previewItems])

  const handleMediaSelect = async (files: FileList | null) => {
    setError('')
    const nextFiles = Array.from(files || [])
    try {
      const validFiles = await validateSocialFiles(nextFiles)
      setMediaFiles(validFiles)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Media tidak valid.'
      setMediaFiles([])
      setError(message)
      pushToast({ tone: 'warning', title: 'Media belum bisa dipakai', message })
    }
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (!mediaFiles.length) throw new Error('Upload foto atau video wajib diisi.')
      return createSocialPost({
        title,
        category,
        description,
        mediaFiles,
        onProgress: setProgress,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      setTitle('')
      setDescription('')
      setMediaFiles([])
      setProgress(0)
      setError('')
      pushToast({ tone: 'success', title: 'Post berhasil diterbitkan', message: 'Feed CookShare sudah diperbarui.' })
      onClose?.()
    },
    onError: (err: any) => {
      const message = err?.message || 'Gagal menerbitkan post.'
      setError(message)
      setProgress(0)
      pushToast({ tone: 'error', title: 'Post gagal diterbitkan', message })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!title.trim()) return setError('Judul post wajib diisi.')
    if (!description.trim()) return setError('Deskripsi wajib diisi.')
    if (!mediaFiles.length) return setError('Pilih foto atau video dari perangkat.')
    createMutation.mutate()
  }

  const hasVideo = mediaFiles.some((file) => file.type.startsWith('video/'))

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
            multiple
            className="sr-only"
            onChange={(event) => handleMediaSelect(event.target.files)}
          />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              {hasVideo ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {mediaFiles.length ? `${mediaFiles.length} media dipilih` : 'Upload foto tips atau video pendek'}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Sampai {MAX_PHOTO_FILES} foto, atau 1 video max {MAX_VIDEO_DURATION} detik dan {formatBytes(MAX_VIDEO_SIZE)}.
              </p>
            </div>
          </div>
        </label>

        {previewItems.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <div className={`grid gap-2 bg-slate-100 p-2 ${previewItems.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {previewItems.map((item, index) => (
                <div key={`${item.file.name}-${index}`} className="relative aspect-video overflow-hidden rounded-2xl bg-slate-200">
                  {item.file.type.startsWith('video/') ? (
                    <video src={item.url} controls playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={item.url} alt={`Preview media post ${index + 1}`} className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMediaFile(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-rose-600 shadow-sm transition hover:bg-rose-50"
                    title="Hapus media"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-1 px-4 py-3">
              {mediaFiles.map((file, index) => (
                <p key={`${file.name}-${index}`} className="truncate text-[10px] font-black uppercase tracking-wide text-slate-500">
                  {file.name} - {formatBytes(file.size)}
                </p>
              ))}
            </div>
          </div>
        )}

        {(progress > 0 || createMutation.isPending) && (
          <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>{progress >= 100 ? 'Finishing post' : 'Uploading media'}</span>
              <span>{Math.max(progress, createMutation.isPending ? 8 : 0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${Math.max(progress, createMutation.isPending ? 8 : 0)}%` }} />
            </div>
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

function PostDetailDrawer({
  post,
  onClose,
  onLike,
  onFavorite,
  isBusy,
}: {
  post: SocialPostView
  onClose: () => void
  onLike: (post: SocialPostView) => void
  onFavorite: (post: SocialPostView) => void
  isBusy: boolean
}) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const pushToast = useToastStore((state) => state.pushToast)

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
      pushToast({ tone: 'success', title: 'Komentar terkirim', message: 'Thread sudah diperbarui.' })
    },
    onError: (err: any) => {
      const message = err?.message || 'Gagal mengirim komentar.'
      setError(message)
      setProgress(0)
      pushToast({ tone: 'error', title: 'Komentar gagal', message })
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
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[32px] border border-slate-200 bg-white shadow-2xl lg:rounded-[32px]"
      >
        <header className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Post Detail</p>
            <h2 className="line-clamp-1 text-xl font-black text-slate-950">{post.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_420px]">
            <section className="min-h-[320px] bg-slate-950 lg:min-h-[620px]">
              <SocialMedia post={post} detail />
            </section>

            <section className="min-w-0 space-y-5 p-5">
              <div className="flex items-center gap-3">
                <img src={post.author_avatar_url} alt={post.author_name} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-black text-slate-950">{post.author_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.author_role} | {formatTime(post.created_at)}</p>
                </div>
              </div>

              <div className="text-left">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${categoryTone[post.category] || categoryTone['Ingredient Guide']}`}>
                  {post.category}
                </span>
                <h3 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950">{post.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">{post.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onLike(post)}
                  disabled={isBusy}
                  className={`flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black transition disabled:opacity-60 ${
                    post.liked_by_user ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                  {compactCount(post.likes_count)}
                </button>
                <button
                  type="button"
                  onClick={() => onFavorite(post)}
                  disabled={isBusy}
                  className={`flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black transition disabled:opacity-60 ${
                    post.favorited_by_user ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.favorited_by_user ? 'fill-current' : ''}`} />
                  Save
                </button>
                <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-50 text-sm font-black text-slate-600">
                  <MessageCircle className="h-4 w-4" />
                  {compactCount(post.comments_count)}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Komentar</p>
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
            </section>
          </div>
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

function patchPostInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: SocialPostView) => SocialPostView,
) {
  queryClient.setQueryData<SocialPostView[]>(['social-posts'], (current = []) => (
    current.map((post) => post.id === postId ? updater(post) : post)
  ))
}

export default function SocialHub() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const pushToast = useToastStore((state) => state.pushToast)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | SocialCategory>('All')
  const [showMobileComposer, setShowMobileComposer] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [socialActionError, setSocialActionError] = useState('')

  const displayName = getPreferredIdentityName({
    username: user?.username,
    name: user?.name,
    email: user?.email,
  })
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
    onMutate: async (post) => {
      setSocialActionError('')
      await queryClient.cancelQueries({ queryKey: ['social-posts'] })
      const previousPosts = queryClient.getQueryData<SocialPostView[]>(['social-posts'])
      const nextLiked = !post.liked_by_user

      patchPostInCache(queryClient, post.id, (current) => ({
        ...current,
        liked_by_user: nextLiked,
        likes_count: Math.max(0, current.likes_count + (nextLiked ? 1 : -1)),
      }))

      return { previousPosts, postId: post.id, nextLiked }
    },
    onSuccess: (nextLiked, post, context) => {
      patchPostInCache(queryClient, post.id, (current) => {
        const desired = typeof nextLiked === 'boolean' ? nextLiked : context?.nextLiked ?? current.liked_by_user
        return {
          ...current,
          liked_by_user: desired,
          likes_count: Math.max(0, current.likes_count + (desired === current.liked_by_user ? 0 : desired ? 1 : -1)),
        }
      })
      pushToast({
        tone: nextLiked ? 'success' : 'warning',
        title: nextLiked ? 'Like ditambahkan' : 'Like dihapus',
        message: nextLiked ? 'Post sudah masuk daftar yang kamu sukai.' : 'Like untuk post ini sudah dilepas.',
      })
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    },
    onError: (err: any) => {
      const message = err?.message || 'Like gagal diproses. Silakan login ulang jika sesi habis.'
      setSocialActionError(message)
      pushToast({ tone: 'error', title: 'Like gagal', message })
    },
    onSettled: (_data, error, _variables, context) => {
      if (error && context?.previousPosts) {
        queryClient.setQueryData(['social-posts'], context.previousPosts)
      }
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: (post: SocialPostView) => toggleFavoriteItem(post.id, 'post'),
    onMutate: async (post) => {
      setSocialActionError('')
      await queryClient.cancelQueries({ queryKey: ['social-posts'] })
      const previousPosts = queryClient.getQueryData<SocialPostView[]>(['social-posts'])
      const nextFavorited = !post.favorited_by_user

      patchPostInCache(queryClient, post.id, (current) => ({
        ...current,
        favorited_by_user: nextFavorited,
      }))

      return { previousPosts, nextFavorited }
    },
    onSuccess: (nextFavorited, post, context) => {
      patchPostInCache(queryClient, post.id, (current) => ({
        ...current,
        favorited_by_user: typeof nextFavorited === 'boolean' ? nextFavorited : context?.nextFavorited ?? current.favorited_by_user,
      }))
      pushToast({
        tone: nextFavorited ? 'success' : 'warning',
        title: nextFavorited ? 'Favorit disimpan' : 'Favorit dihapus',
        message: nextFavorited ? 'Post sudah masuk My Favorites.' : 'Post sudah keluar dari My Favorites.',
      })
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
    },
    onError: (err: any) => {
      const message = err?.message || 'Favorit gagal diproses. Silakan login ulang jika sesi habis.'
      setSocialActionError(message)
      pushToast({ tone: 'error', title: 'Favorit gagal', message })
    },
    onSettled: (_data, error, _variables, context) => {
      if (error && context?.previousPosts) {
        queryClient.setQueryData(['social-posts'], context.previousPosts)
      }
    },
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
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
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

        <main className="min-w-0 w-full max-w-[calc(100vw-2rem)] space-y-5 overflow-hidden lg:max-w-none">
          <section className="w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm lg:max-w-none">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live creator feed
                </div>
                <h1 className="mt-3 max-w-full whitespace-normal text-[22px] font-black leading-tight tracking-tight text-slate-950 [overflow-wrap:anywhere] sm:text-3xl md:text-5xl">
                  <span>Halo, {displayName}.</span>
                  <span className="block sm:inline"> Share what works</span>
                  <span className="block sm:inline"> in your kitchen.</span>
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
                  onOpenDetail={(item) => setSelectedPostId(item.id)}
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
        {selectedPost && (
          <PostDetailDrawer
            post={selectedPost}
            onClose={() => setSelectedPostId(null)}
            onLike={(item) => likeMutation.mutate(item)}
            onFavorite={(item) => favoriteMutation.mutate(item)}
            isBusy={busyPostId === selectedPost.id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
