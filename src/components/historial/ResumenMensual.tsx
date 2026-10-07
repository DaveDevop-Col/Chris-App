'use client'

import { useEffect, useState } from 'react'
import { formatearPesos, formatearMesAnio } from '@/lib/format'
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
          <p>Compras: {h.num_compras} - Productos: {h.num_productos} - Total: {formatearPesos(h.total_gastado)} - {h.estado}</p>
        </div>
      ))}
    </div>
  )
}