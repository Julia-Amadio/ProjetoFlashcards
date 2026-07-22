export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? 'logo--light' : ''}`} aria-label="Karta">
      <span className="logo-mark"><i /><i /><i /></span>
      <span>Karta<span className="logo-dot">.</span></span>
    </div>
  )
}
