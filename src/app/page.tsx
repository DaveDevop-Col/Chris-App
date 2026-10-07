import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import InicioClient from './inicio-client'

export const dynamic = 'force-dynamic'

export default function InicioRoute() {
  return (
    <Layout pestanas={false}>
      <AuthGuard>
        <InicioClient />
      </AuthGuard>
    </Layout>
  )
}