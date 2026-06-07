import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, ChefHat, Coins, Loader2, Save, Sparkles, Wand2 } from '@icons/CookEduIcons'
import { motion } from 'framer-motion'
import { chefAiApi, coinApi, type ChefAiDraftRecipe } from '../../lib/api'
import { saveSupabaseAdminRecipe } from '../../lib/supabaseData'
import { useAuthStore } from '../../store'
import { getPreferredIdentityName } from '../../lib/supabaseClient'
import { useToastStore } from '../../store/toastStore'

const AI_BOOST_COST = 15

export default function AiManager() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const pushToast = useToastStore((state) => state.pushToast)
  const displayName = getPreferredIdentityName({ username: user?.username, name: user?.name, email: user?.email })
  const [prompt, setPrompt] = useState('Buat resep official CookEdu yang sehat, murah, bahan mudah dicari, cocok untuk pemula.')
  const [draft, setDraft] = useState<ChefAiDraftRecipe | null>(null)
  const [notes, setNotes] = useState<string[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState('')

  const generateDraft = async () => {
    if (prompt.trim().length < 3) {
      pushToast({ tone: 'warning', title: 'Brief terlalu pendek', message: 'Tulis ide resep atau masalah data yang ingin dirapikan.' })
      return
    }

    setLoading('generate')
    try {
      await coinApi.spendCoins({ spend_type: 'ai_boost', reference_id: `admin-draft-${Date.now()}` })
      const response = await chefAiApi.adminDraft({
        prompt,
        user_name: displayName,
      })
      setDraft(response.data.draft || null)
      setNotes(response.data.cleanup_notes || [])
      setReply(response.data.reply || '')
      pushToast({
        tone: 'success',
        title: 'Draft AI siap',
        message: `${AI_BOOST_COST} koin dipakai. Tinjau draft sebelum simpan.`,
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Admin AI gagal',
        message: error instanceof Error ? error.message : 'Coba ulangi beberapa saat lagi.',
      })
    } finally {
      setLoading('')
    }
  }

  const saveDraft = async () => {
    if (!draft) return

    setLoading('save')
    try {
      await saveSupabaseAdminRecipe({
        title: draft.title,
        category: draft.category,
        description: draft.description,
        difficulty: draft.difficulty,
        cooking_time: draft.cooking_time,
        prep_time: draft.prep_time,
        servings: draft.servings,
        ingredients: draft.ingredients,
        steps: draft.steps,
        image: null,
        existingImageUrl: null,
        videoUrl: null,
        is_published: false,
        isOfficial: true,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      pushToast({
        tone: 'success',
        title: 'Draft tersimpan',
        message: 'Resep masuk ke Supabase sebagai draft unpublished.',
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Gagal menyimpan draft',
        message: error instanceof Error ? error.message : 'Coba lagi setelah cek RLS/admin role.',
      })
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-[36px] bg-slate-950 p-7 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">CookEdu Admin AI</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-6xl">AI Recipe Manager</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/65">
              Rapikan ide resep, buat draft official, dan simpan ke Supabase sebagai unpublished draft agar tetap aman untuk Android dan web.
            </p>
          </div>
          <span className="flex w-fit items-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
            <Coins className="h-4 w-4" /> {AI_BOOST_COST} koin per draft
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Prompt Admin</p>
              <h2 className="text-xl font-black text-slate-950">Brief resep</h2>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-56 w-full rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-6 outline-none focus:border-cyan-400"
            placeholder="Contoh: rapikan resep ayam geprek agar ingredients dan steps cocok untuk schema recipes..."
          />

          <button
            type="button"
            onClick={generateDraft}
            disabled={loading === 'generate'}
            className="mt-4 flex h-13 w-full items-center justify-center gap-3 rounded-[22px] bg-slate-950 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
          >
            {loading === 'generate' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5 text-cyan-300" />}
            Generate Draft
          </button>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          {!draft ? (
            <div className="flex min-h-[440px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-slate-300" />
              <h2 className="text-2xl font-black text-slate-950">Belum ada draft</h2>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                Tulis brief di kiri. AI akan mengembalikan draft recipe yang sudah disesuaikan dengan field production.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">{draft.category}</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{draft.title}</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{draft.description}</p>
                </div>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={loading === 'save'}
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                >
                  {loading === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Draft
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ['Level', draft.difficulty],
                  ['Masak', `${draft.cooking_time} menit`],
                  ['Prep', `${draft.prep_time} menit`],
                  ['Porsi', `${draft.servings}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700">
                    <ChefHat className="h-4 w-4 text-cyan-700" /> Ingredients
                  </h3>
                  <div className="space-y-2">
                    {draft.ingredients.map((item, index) => (
                      <p key={`${item.item}-${index}`} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600">
                        {item.item} {item.amount ? `${item.amount} ${item.unit || ''}` : ''}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700">
                    <Sparkles className="h-4 w-4 text-cyan-700" /> Steps
                  </h3>
                  <div className="space-y-3">
                    {draft.steps.map((step, index) => (
                      <div key={`${step.instruction}-${index}`} className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Step {index + 1}</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{step.instruction}</p>
                        {step.tip && <p className="mt-2 text-xs font-semibold text-slate-400">{step.tip}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(reply || notes.length > 0) && (
                <div className="rounded-[24px] border border-cyan-100 bg-cyan-50 p-5">
                  <p className="text-sm font-black text-cyan-900">{reply || 'Cleanup notes'}</p>
                  {notes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {notes.map((note) => (
                        <p key={note} className="text-sm font-semibold leading-6 text-cyan-800">{note}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.article>
      </section>
    </div>
  )
}
