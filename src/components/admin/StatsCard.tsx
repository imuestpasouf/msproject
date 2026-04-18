type StatsCardProps = {
  icon: React.ReactNode
  value: string | number
  label: string
  accent?: boolean
}

export default function StatsCard({ icon, value, label, accent }: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-sm p-6 flex items-start gap-4"
      style={{ boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}
    >
      <div
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-sm"
        style={{
          background: accent ? 'rgba(201,149,108,0.12)' : 'rgba(0,0,0,0.04)',
          color: accent ? '#c9956c' : '#9a9590',
        }}
      >
        {icon}
      </div>
      <div>
        <p
          className="font-light leading-none mb-1.5"
          style={{ fontSize: '1.9rem', color: '#0a0a0a' }}
        >
          {value}
        </p>
        <p
          className="text-[0.6rem] tracking-[0.2em] uppercase"
          style={{ color: '#9a9590' }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}
