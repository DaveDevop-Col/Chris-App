'use client'

import { useState } from 'react'
import { formatearPesos } from '@/lib/format'
import { eliminarProducto } from '@/lib/datos'
import type { ProductoGasto, Compra } from '@/lib/types'

type Props = {
  compra: Compra
  productos: ProductoGasto[]
  puedeEditar: boolean
  onEditar: (p: ProductoGasto) => void
  onActualizado: () => void
  setError: (v: string | null) => void
  setExito: (v: string | null) => void
}

export default function ListaProductos({
  compra,
  productos,
  puedeEditar,
  onEditar,
  onActualizado,
  setError,
  setExito,
}: Props) {
  const [eliminando, setEliminando] = useState(false)

  const total = productos.reduce((s, p) => s + p.valor, 0)

  async function borrar(p: ProductoGasto) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('¿Eliminar "' + p.nombre_gasto + '"?')
      if (!ok) return
    }
    setEliminando(true)
    try {
      await eliminarProducto(p.id)
      setExito('Producto eliminado.')
      onActualizado()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el producto.')
    } finally {
      setEliminando(false)
    }
  }

  if (productos.length === 0) {
    return (
      <div className='lista'>
        <h2 className='lista__titulo'>Productos de la compra</h2>
        <p className='lista__vacia'>Aún no hay productos en esta compra.</p>
      </div>
    )
  }

  return (
    <div className='lista'>
      <h2 className='lista__titulo'>Productos de la compra</h2>
      <ul className='lista__items'>
        {productos.map((p) => (
          <li key={p.id} className='tarjeta registro'>
            <div className='registro__datos'>
              <span className='registro__nombre'>{p.nombre_gasto}</span>
              <span className='registro__meta'>
                Cantidad: {p.cantidad} • Valor: {formatearPesos(p.valor)}
              </span>
            </div>
            <div className='registro__lado'>
              <span className='registro__valor'>{formatearPesos(p.valor)}</span>
              {puedeEditar && (
                <div className='registro__acciones'>
                  <button type='button' className='boton boton--secundario boton--chico' onClick={() => onEditar(p)}>
                    Editar
                  </button>
                  <button
                    type='button'
                    className='boton boton--peligro boton--chico'
                    onClick={() => borrar(p)}
                    disabled={eliminando}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className='pagina__subtitulo'>Total acumulado: {formatearPesos(total)}</p>
    </div>
  )
}
