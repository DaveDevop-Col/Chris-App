import { MESES } from './types'

const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatearPesos(valor: number): string {
  return formatoPesos.format(Math.round(valor))
}

export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  if (!anio || !mes || !dia) return fecha
  return formatoFecha.format(new Date(anio, mes - 1, dia))
}

export function formatearMesAnio(mes: number, anio: number) {
  const m = MESES[mes - 1] ?? ''
  return m + ' ' + anio
}