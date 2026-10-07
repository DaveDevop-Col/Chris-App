'use client'

import { useState } from 'react'
import { formatearPesos, formatearFecha } from '@/lib/format'
import { listarProductosCompra, actualizarCompra } from '@/lib/datos'
import type { Compra, ProductoGasto } from '@/lib/types'

type Props = {
  compras: Compra[]
  perfiles: Record<string, string>
  usuarioId: string
  onActualizado: () => void
  setError: (v: string | null) => void
}

export default function ComprasPendientesSaldo({
  compras,
  perfiles,
  usuarioId,
  onActualizado,
  setError,
}: Props) {
  const [expandida, setExpandida] = useState<Record<string, boolean>>({})
  const [productosMap, setProductosMap] = useState<Record<string, ProductoGasto[]>>({})

  async function toggle(id: string) {
    const n = !expandida[id]
    setExpandida({ ...expandida, [id]: n })
    if (n && !productosMap[id]) {
      try {
        const prods = await listarProductosCompra(id)
        setProductosMap({ ...productosMap, [id]: prods })
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function saldar(c: Compra) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('¿Marcar esta compra como saldada? Esta acción no se puede deshacer.')
      if (!ok) return
    }
    try {
      setError(null)
      await actualizarCompra(c.id, { estado: 'saldado' })
      onActualizado()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo saldar la compra')
    }
  }

  if (compras.length === 0) {
    return (
      <div className='lista'>
        <h2>Compras que componen el saldo</h2>
        <p>No hay compras pendientes para saldar</p>
      </div>
    )
  }

  return (
    <div className='lista'>
      <h2>Compras que componen el saldo</h2>
      <ul className='lista__items'>
        {compras.map((c) => {
          const nombre = perfiles[c.user_id] ?? ''
          const esMio = c.user_id === usuarioId
          const parte = Math.round(c.total / 2)
          const prods = productosMap[c.id] ?? []
          const expand = expandida[c.id]
          return (
            <li key={c.id} className='tarjeta registro'>
              <div className='registro__datos'>
                <span className='registro__fecha'>{formatearFecha(c.fecha)}</span>
                <span className='registro__nombre'>{c.descripcion || 'Compra'}</span>
                <span className='registro__meta'>
                  Quién la creó: {nombre} • N° productos: {prods.length}
                </span>
              </div>
              <div className='registro__lado'>
                <span className='registro__valor'>{formatearPesos(c.total)}</span>
                <div className='registro__acciones'>
                  <button className='boton boton--secundario boton--chico' type='button' onClick={() => toggle(c.id)}>
                    {expand ? 'Ocultar' : 'Ver productos'}
                  </button>
                  {esMio && (
                    <button className='boton boton--primario boton--chico' type='button' onClick={() => saldar(c)}>
                      Marcar saldada
                    </button>
                  )}
                </div>
              </div>
              {expand && (
                <div style={{ marginTop: 16 }}>
                  <p>Parte de la otra persona: {formatearPesos(parte)}</p>
                  {esMio ? <p>Te deben {formatearPesos(parte)}</p> : <p>Debes {formatearPesos(parte)}</p>}
                  {prods.map((p) => (
                    <div key={p.id}>
                      {p.nombre_gasto} - {p.cantidad} x {formatearPesos(p.valor)}
                    </div>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
