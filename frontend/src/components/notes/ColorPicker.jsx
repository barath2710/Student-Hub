import React from 'react'

const colorSwatches = [
  { value: 'default', label: 'Default', bgClass: 'bg-white/10 border-white/20', circleClass: 'bg-slate-400' },
  { value: 'red', label: 'Red', bgClass: 'bg-rose-500/20 border-rose-500/30', circleClass: 'bg-rose-500' },
  { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500/20 border-orange-500/30', circleClass: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-amber-500/20 border-amber-500/30', circleClass: 'bg-amber-400' },
  { value: 'green', label: 'Green', bgClass: 'bg-emerald-500/20 border-emerald-500/30', circleClass: 'bg-emerald-500' },
  { value: 'teal', label: 'Teal', bgClass: 'bg-teal-500/20 border-teal-500/30', circleClass: 'bg-teal-400' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-500/20 border-purple-500/30', circleClass: 'bg-purple-500' },
]

export default function ColorPicker({ value = 'default', onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white/70">Theme Colour</label>
      <div className="flex flex-wrap gap-2">
        {colorSwatches.map((swatch) => (
          <button
            key={swatch.value}
            type="button"
            onClick={() => onChange(swatch.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${swatch.circleClass} ${
              value === swatch.value
                ? 'ring-2 ring-indigo-500 border-white'
                : 'border-transparent hover:scale-110'
            }`}
            title={swatch.label}
          >
            {value === swatch.value && <span className="text-[10px] text-white">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
