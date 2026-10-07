'use client'

import { useState } from 'react'
import ComprasPorMes from '@/components/historial/ComprasPorMes'
import ResumenMensual from '@/components/historial/ResumenMensual'

export default function HistorialClient() {
  const [tab, setTab] = useState<'mes' | 'resumen'>('mes')

  return (
    <section className='pagina'>
      <h1 className='pagina__titulo'>Historial</h1>
      <div className='pestanas'>
        <button className={`pestanas__boton ${tab === 'mes' ? 'pestanas__boton--activa' : ''}`} onClick={() => setTab('mes')}>Compras por mes</button>
        <button className={`pestanas__boton ${tab === 'resumen' ? 'pestanas__boton--activa' : ''}`} onClick={() => setTab('resumen')}>Resumen mensual</button>
      </div>
      {tab === 'mes' && <ComprasPorMes />}
      {tab === 'resumen' && <ResumenMensual />}
    </section>
  )
}