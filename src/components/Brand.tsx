export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="CampusFix">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span>Campus<span>Fix</span></span>}
    </div>
  )
}
