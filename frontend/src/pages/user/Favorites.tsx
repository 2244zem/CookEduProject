import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Bookmark, ChefHat, ExternalLink, Heart, Loader2, Trash2 } from 'lucide-react'
import { listFavoriteItems, toggleFavoriteItem, type FavoriteItemView } from '../../lib/supabaseData'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'

function FavoriteCard({ item, onRemove, isRemoving }: {
  item: FavoriteItemView
  onRemove: (item: FavoriteItemView) => void
  isRemoving: boolean
}) {
  const imageUrl = resolveMediaUrl(item.image_url) || avatarFallbackUrl(item.title)

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link to={item.href} className="block text-left">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">
            {item.item_type === 'recipe' ? 'Recipe' : 'Social Post'}
          </span>
        </div>
      </Link>

      <div className="space-y-4 p-5 text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">{item.category}</p>
          <h2 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-slate-950">{item.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to={item.href} className="flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700">
            Open
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onRemove(item)}
            disabled={isRemoving}
            className="flex h-10 items-center gap-2 rounded-2xl bg-rose-50 px-4 text-xs font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Favorites() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'recipe' | 'post'>('all')
  const favoritesQuery = useQuery({
    queryKey: ['favorite-items'],
    queryFn: listFavoriteItems,
  })

  const removeMutation = useMutation({
    mutationFn: (item: FavoriteItemView) => toggleFavoriteItem(item.item_id, item.item_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    },
  })

  const items = favoritesQuery.data || []
  const filteredItems = filter === 'all' ? items : items.filter((item) => item.item_type === filter)
  const recipeCount = items.filter((item) => item.item_type === 'recipe').length
  const postCount = items.filter((item) => item.item_type === 'post').length
  const filters = [
    { id: 'all', label: 'All', count: items.length },
    { id: 'recipe', label: 'Recipes', count: recipeCount },
    { id: 'post', label: 'Posts', count: postCount },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                <Bookmark className="h-3.5 w-3.5" />
                Saved kitchen references
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">My Favorites</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                Semua resep dan post sosial yang kamu simpan, dirender cepat untuk akses dapur.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-72">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-left">
                <ChefHat className="h-5 w-5 text-cyan-700" />
                <p className="mt-3 text-3xl font-black text-slate-950">{recipeCount}</p>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Recipes</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-left">
                <Heart className="h-5 w-5 text-rose-700" />
                <p className="mt-3 text-3xl font-black text-slate-950">{postCount}</p>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Posts</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`h-11 min-w-28 flex-1 rounded-2xl px-4 text-xs font-black uppercase tracking-widest transition ${
                filter === item.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label} <span className="opacity-70">({item.count})</span>
            </button>
          ))}
        </div>

        {favoritesQuery.isError ? (
          <div className="rounded-[30px] border border-amber-200 bg-amber-50 p-8 text-left">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Favorites belum tersambung ke Supabase.</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Jalankan file supabase_social_hub_schema.sql di Supabase SQL Editor agar tabel favorites tersedia.
                </p>
              </div>
            </div>
          </div>
        ) : favoritesQuery.isLoading ? (
          <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-700" />
            <p className="mt-3 text-sm font-black text-slate-500">Loading favorites...</p>
          </div>
        ) : filteredItems.length ? (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((item) => (
              <FavoriteCard
                key={item.favorite_id}
                item={item}
                onRemove={(target) => removeMutation.mutate(target)}
                isRemoving={removeMutation.isPending && removeMutation.variables?.favorite_id === item.favorite_id}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-700">
              {items.length ? 'Tidak ada item di filter ini.' : 'Belum ada favorit.'}
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {items.length ? 'Pilih filter lain untuk melihat simpananmu.' : 'Simpan resep atau social post dari feed untuk mulai mengisi halaman ini.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
