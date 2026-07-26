import { AlertTriangle, Inbox, LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type PageStateProps = {
  kind: 'loading' | 'error' | 'empty'
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
}

const defaultIcons = {
  loading: LoaderCircle,
  error: AlertTriangle,
  empty: Inbox,
}

export function PageState({ kind, title, description, action, icon: CustomIcon }: PageStateProps) {
  const Icon = CustomIcon ?? defaultIcons[kind]
  return <section className={`page-state page-state--${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live="polite">
    <span className="page-state__icon"><Icon /></span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {action && <div className="page-state__action">{action}</div>}
  </section>
}
