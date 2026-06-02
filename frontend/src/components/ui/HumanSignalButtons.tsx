import { useState } from 'react'

type HumanSignal = 'Jeda' | 'Cek ulang' | 'Lanjut'

const signals: Array<{
  value: HumanSignal
  label: string
  caption: string
  className: string
}> = [
  {
    value: 'Jeda',
    label: 'Jeda',
    caption: 'Merah',
    className: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
  },
  {
    value: 'Cek ulang',
    label: 'Cek',
    caption: 'Kuning',
    className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    value: 'Lanjut',
    label: 'Lanjut',
    caption: 'Hijau',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
]

export default function HumanSignalButtons() {
  const [active, setActive] = useState<HumanSignal>('Lanjut')

  return (
    <section className="rounded-3xl border border-[#B1BBC8]/55 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-black text-[#102033]">Sinyal dapur</h2>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
          Pilih ritme sebelum lanjut, biar masaknya tetap tenang.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {signals.map((signal) => (
          <button
            key={signal.value}
            type="button"
            onClick={() => setActive(signal.value)}
            className={`rounded-2xl border px-3 py-3 text-center transition active:scale-[0.98] ${signal.className} ${
              active === signal.value ? 'ring-2 ring-[#2A4D88]/20' : ''
            }`}
          >
            <span className="mx-auto mb-2 block h-4 w-4 rounded-full bg-current" />
            <span className="block text-[12px] font-black">{signal.label}</span>
            <span className="block text-[9px] font-black uppercase tracking-widest opacity-65">{signal.caption}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-bold text-slate-500">Status hari ini: {active}</p>
    </section>
  )
}
