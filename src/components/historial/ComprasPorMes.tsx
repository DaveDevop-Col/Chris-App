'use client'

import { useEffect, useState } from 'react'
import { formatearPesos, formatearFecha, formatearMesAnio, plural, textoEstado, claseEstado } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { listarProductosCompra } from '@/lib/datos'
import type { Compra, ProductoGasto } from '@/lib/types'

export default function ComprasPorMes() {
  const [compras, setCompras] = useState<(Compra & { num_productos?: number })[]>([])
  const [perfiles, setPerfiles] = useState<Record<string, string>>({})
  const [productosMap, setProductosMap] = useState<Record<string, ProductoGasto[]>>({})
  const [expandida, setExpandida] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('compras')
          .select('*, gastos(count)')
          .eq('cerrada', true)
          .order('fecha', { ascending: false })
          .order('created_at', { ascending: false })
        if (error) throw error
        const mapCount = (data ?? []).map((c: Compra & { gastos?: { count: number }[] }) => ({
          ...c,
          num_productos: c.gastos?.[0]?.count ?? 0,
        }))
        setCompras(mapCount)
        const ids = Array.from(new Set(mapCount.map((c) => c.user_id)))
        if (ids.length > 0) {
          const { data: p } = await supabase.from('profiles').select('id,nombre').in('id', ids)
          const map: Record<string, string> = {}
          p?.forEach((x: { id: string; nombre: string }) => (map[x.id] = x.nombre))
          setPerfiles(map)
        }
      } catch (e) {
        console.error(e)
      }
    }
    cargar()
  }, [])

  const grupos = compras.reduce((acc, c) => {
    const [a, m] = c.fecha.split('-')
    const key = `${a}-${m}`
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {} as Record<string, (Compra & { num_productos?: number })[]>)

  const mesesOrdenados = Object.keys(grupos).sort((a, b) => b.localeCompare(a))

  async function toggle(id: string) {
    const n = !expandida[id]
    setExpandida({ ...expandida, [id]: n })
    if (n && !productosMap[id]) {
      const prods = await listarProductosCompra(id)
      setProductosMap({ ...productosMap, [id]: prods })
    }
  }

  return (
    <div>
      {mesesOrdenados.map((k) => {
        const list = grupos[k]
        const [a, m] = k.split('-')
        const total = list.reduce((s, c) => s + c.total, 0)
        return (
          <div key={k} className='lista'>
            <h3>
              {formatearMesAnio(Number(m), Number(a))}: {list.length}{' '}
              {plural(list.length, 'compra', 'compras')}, total {formatearPesos(total)}
            </h3>
            <ul className='lista__items'>
              {list.map((c) => {
                const prods = productosMap[c.id] ?? []
                const nombre = perfiles[c.user_id] ?? ''
                const expand = expandida[c.id]
                return (
                  <li key={c.id} className='tarjeta registro'>
                    <div>
                      {formatearFecha(c.fecha)} - {c.descripcion || 'Compra'} - {nombre} - {c.num_productos ?? prods.length}{' '}
                      {plural(c.num_productos ?? prods.length, 'producto', 'productos')} - {formatearPesos(c.total)} -{' '}
                      <span className={claseEstado(c.estado)}>{textoEstado(c.estado)}</span>
                    </div>
                    <button
                      type='button'
                      className='boton boton--secundario boton--chico'
                      onClick={() => toggle(c.id)}
                    >
                      {expand ? 'Ocultar' : 'Ver productos'}
                    </button>
                    {expand && prods.map((p) => (
                      <div key={p.id}>{p.nombre_gasto} x{p.cantidad} - {formatearPesos(p.valor)}</div>
                    ))}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}