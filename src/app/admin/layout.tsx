/**
 * Admin layout — renders as a full-viewport overlay (z-[200]) so the public
 * site's Navbar/Footer/Banner from the root layout are completely hidden.
 * Avoids the need to restructure into route groups while keeping a clean UI.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ background: '#0a0a0a' }}
    >
      {children}
    </div>
  )
}
