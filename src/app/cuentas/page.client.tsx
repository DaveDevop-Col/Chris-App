'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { formatearPesos } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { listarComprasCerradasPendientes, listarProductosCompra, actualizarCompra } from '@/lib/datos'
import type { Compra } from '@/lib/types'
import SaldoResumen from '@/components/cuentas/SaldoResumen'
import ComprasPendientesSaldo from '@/components/cuentas/ComprasPendientesSaldo'

export default function CuentasClient() {
  const { user, perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [perfiles, setPerfiles] = useState<Record<string, string>>({})

  async function cargar() {
    try {
      setError(null)
      setCargando(true)
      const data = await listarComprasCerradasPendientes()
      setCompras(data)
      const ids = Array.from(new Set([user?.id, ...(data.map((c) => c.user_id))].filter(Boolean) as string[]))
      if (ids.length > 0) {
        const { data: p } = await supabase.from('profiles').select('id,nombre').in('id', ids)
        const map: Record<string, string> = {}
        p?.forEach((x: any) => (map[x.id] = x.nombre))
        setPerfiles(map)
      }
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const usuarioId = user?.id
  const otroId = (Object.keys(perfiles).find((id) => id !== usuarioId)) || ''
  const usuarioNombre = (perfil?.nombre || perfiles[usuarioId || ''] || '').split(' ')[0]
  const otroNombre = (perfiles[otroId] || '').split(' ')[0]
  const misPendientes = compras.filter((c) => c.user_id === usuarioId).reduce((s, c) => s + c.total, 0)
  const pendientesOtro = compras.filter((c) => c.user_id === otroId).reduce((s, c) => s + c.total, 0)
  const saldoNeto = (misPendientes - pendientesOtro) / 2

  if (cargando) return <p>Cargando...</p>
  return (
    <section className='pagina'>
      <h1 className='pagina__titulo'>Cuentas</h1>
      {error && <p className='alerta alerta--error'>{error}</p>}
      <SaldoResumen saldo={saldoNeto} nombreA={usuarioNombre} nombreB={otroNombre} usuarioNombre={usuarioNombre} />
      <div className='tarjeta'>
        <p>{otroNombre} te debe {formatearPesos(Math.round(misPendientes / 2))} por tus compras pendientes</p>
      </div>
      <div className='tarjeta'>
        <p>Le debes {formatearPesos(Math.round(pendientesOtro / 2))} a {otroNombre} por sus compras pendientes</p>
      </div>
      <ComprasPendientesSaldo
        compras={compras}
        perfiles={perfiles}
        usuarioId={usuarioId || ''}
        onActualizado={cargar}
        setError={setError}
      />
      <p>Las compras en curso no cuentan hasta que se terminan.</p>
    </section>
  )
}