'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { formatearPesos, formatearFecha, plural, textoEstado, claseEstado } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { actualizarCompra, eliminarCompra, listarProductosCompra } from '@/lib/datos'
import type { Compra, ProductoGasto } from '@/lib/types'

type CompraConProductos = Compra & { num_productos?: number }

type Props = {
  compras: Compra[]
  user?: any
  perfil?: any
  compraAbierta?: Compra | null
  onReabrir: () => void
  onEliminar: () => void
  setError: (v: string | null) => void
}

export default function ComprasDelMes({
  compras,
  user,
  perfil,
  compraAbierta,
  onReabrir,
  onEliminar,
  setError,
}: Props) {
  const [expandida, setExpandida] = useState<Record<string, boolean>>({})
  const [productosMap, setProductosMap] = useState<Record<string, ProductoGasto[]>>({})
  const [perfilesMap, setPerfilesMap] = useState<Record<string, string>>({})
  const [conteo, setConteo] = useState<Record<string, number>>({})
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  function reportar(e: unknown, mensaje: string) {
    console.error(e)
    const texto = e instanceof Error ? e.message : mensaje
    setErrorLocal(texto)
    setError(texto)
  }

  useEffect(() => {
    const ids = Array.from(new Set(compras.map((c) => c.user_id)))
    if (ids.length > 0) {
      supabase
        .from('profiles')
        .select('id,nombre')
        .in('id', ids)
        .then(({ data }) => {
          const map: Record<string, string> = {}
          data?.forEach((p: any) => (map[p.id] = p.nombre))
          setPerfilesMap(map)
        })
    }
  }, [compras])

  useEffect(() => {
    const ids = compras.map((c) => c.id)
    if (ids.length === 0) return
    Promise.all(
      ids.map(async (id) => {
        try {
          const prods = await listarProductosCompra(id)
          return { id, count: prods.length, prods }
        } catch {
          return { id, count: 0, prods: [] }
        }
      }),
    ).then((res) => {
      const c: Record<string, number> = {}
      const p: Record<string, ProductoGasto[]> = {}
      res.forEach((r) => {
        c[r.id] = r.count
        p[r.id] = r.prods
      })
      setConteo(c)
      setProductosMap(p)
    })
  }, [compras])

  async function toggleExpand(id: string) {
    const nueva = !expandida[id]
    setExpandida({ ...expandida, [id]: nueva })
  }

async function reabrir(c: Compra) {
    try {
      setErrorLocal(null)
      await actualizarCompra(c.id, { cerrada: false })
      onReabrir()
    } catch (e) {
      reportar(e, 'No se pudo editar la compra')
    }
  }

  async function borrar(c: Compra) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('¿Eliminar compra? Se eliminarán sus productos.')
      if (!ok) return
    }
    try {
      setErrorLocal(null)
      await eliminarCompra(c.id)
      onEliminar()
    } catch (e) {
      reportar(e, 'No se pudo eliminar la compra')
    }
  }

  const listaMostrar: any[] = []
  if (compraAbierta && user?.id === compraAbierta.user_id) {
    listaMostrar.push({ ...compraAbierta, _enCurso: true })
  }
  compras.forEach((c) => {
    if (compraAbierta && c.id === compraAbierta.id) return
    if (!c.cerrada) return
    listaMostrar.push(c)
  })

  if (listaMostrar.length === 0) {
    return (
      <div className='lista'>
        <h2 className='lista__titulo'>Compras del mes</h2>
        <p className='lista__vacia'>Aún no hay compras este mes.</p>
      </div>
    )
  }

  return (
    <div className='lista'>
      <h2 className='lista__titulo'>Compras del mes</h2>
      <ul className='lista__items'>
        {listaMostrar.map((c) => {
          const esMio = user?.id === c.user_id
          const nombre = perfilesMap[c.user_id] ?? perfil?.nombre ?? ''
          const prods = productosMap[c.id] ?? []
          const numProd = conteo[c.id] ?? prods.length
          const total = prods.reduce((s, p) => s + p.valor, 0)
          const expand = expandida[c.id]
          return (
            <li key={c.id} className='tarjeta registro'>
              <div className='registro__datos'>
                <span className='registro__fecha'>{formatearFecha(c.fecha)}</span>
                <span className='registro__nombre'>{c.descripcion || 'Compra'}</span>
                <span className='registro__meta'>
                  N° {plural(numProd, 'producto', 'productos')}: {numProd} • Registrado por: {nombre} • Estado:{' '}
                  {c._enCurso ? 'En curso' : <span className={claseEstado(c.estado)}>{textoEstado(c.estado)}</span>}
                </span>
              </div>
              <div className='registro__lado'>
                <span className='registro__valor'>{formatearPesos(c.total)}</span>
                <div className='registro__acciones'>
                  <button type='button' className='boton boton--secundario boton--chico' onClick={() => toggleExpand(c.id)}>
                    {expand ? 'Ocultar' : 'Ver productos'}
                  </button>
                  {esMio && c.estado === 'pendiente' && c.cerrada && (
                    <button type='button' className='boton boton--secundario boton--chico' onClick={() => reabrir(c)}>
                      Editar compra
                    </button>
                  )}
                  {esMio && c.estado === 'pendiente' && !c._enCurso && (
                    <button type='button' className='boton boton--peligro boton--chico' onClick={() => borrar(c)}>
                      Eliminar compra
                    </button>
                  )}
                </div>
              </div>
              {expand && (
                <div style={{ marginTop: 16 }}>
                  {prods.length === 0 ? (
                    <p className='lista__vacia'>Sin productos</p>
                  ) : (
                    <ul className='lista__items'>
                      {prods.map((p) => (
                        <li key={p.id} className='tarjeta registro'>
                          <div className='registro__datos'>
                            <span className='registro__nombre'>{p.nombre_gasto}</span>
                            <span className='registro__meta'>
                              Cantidad: {p.cantidad} • Valor: {formatearPesos(p.valor)}
                            </span>
                          </div>
                          <div className='registro__lado'>
                            <span className='registro__valor'>{formatearPesos(p.valor)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {prods.length > 0 && <p>Total: {formatearPesos(total)}</p>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

