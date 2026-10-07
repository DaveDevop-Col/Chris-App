'use client'

import { useEffect, useState } from 'react'
import { formatearPesos, formatearMesAnio, plural, textoEstado, claseEstado } from '@/lib/format'
import { listarHistorial } from '@/lib/datos'
import type { FilaHistorial } from '@/lib/types'

export default function ResumenMensual() {
  const [hist, setHist] = useState<FilaHistorial[]>([])

  useEffect(() => {
    listarHistorial().then(setHist).catch(console.error)
  }, [])

  return (
    <div className='lista'>
      {hist.map((h) => (
        <div key={h.id} className='tarjeta'>
          <p>{formatearMesAnio(h.mes, h.anio)}</p>
          <p>
            Compras: {h.num_compras} {plural(h.num_compras, 'compra', 'compras')} - Productos: {h.num_productos}{' '}
            {plural(h.num_productos, 'producto', 'productos')} - Total: {formatearPesos(h.total_gastado)} -{' '}
            <span className={claseEstado(h.estado)}>{textoEstado(h.estado)}</span>
          </p>
        </div>
      ))}
    </div>
  )
}