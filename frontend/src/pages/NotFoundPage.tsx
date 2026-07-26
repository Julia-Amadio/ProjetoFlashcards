import { ArrowLeft } from 'lucide-react'
import { PageState } from '../components/PageState'

export function NotFoundPage({ navigate }: { navigate: (path: string) => void }) {
  return <div className="page-wrap not-found-page">
    <PageState
      kind="error"
      title="Página não encontrada"
      description="O endereço pode estar incorreto ou a página pode ter sido movida."
      action={<button className="primary-button compact" onClick={() => navigate('/')}><ArrowLeft /> Voltar ao painel</button>}
    />
  </div>
}
