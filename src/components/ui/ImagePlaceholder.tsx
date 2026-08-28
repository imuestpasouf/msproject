import clsx from 'clsx'

export default function ImagePlaceholder({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={clsx(
        'absolute inset-0 flex items-center justify-center border border-dashed',
        dark ? 'border-white/20 bg-white/5' : 'border-gm/40 bg-off',
      )}
    >
      <span className={clsx('text-[0.62rem] tracking-[0.12em] uppercase px-4 text-center', dark ? 'text-white/60' : 'text-gm')}>
        {label}
      </span>
    </div>
  )
}
