export type Perfil = {
  id: string
  nombre: string
  usuario: string
  created_at: string
  debe_cambiar_clave?: boolean
}

export type Compra = {
  id: string
  user_id: string
  descripcion: string | null
  fecha: string
  total: number
  cerrada: boolean
  estado: 'pendiente' | 'saldado'
  saldado_at: string | null
  created_at: string
  updated_at: string
}

export type ProductoGasto = {
  id: string
  user_id: string
  compra_id: string
  nombre_gasto: string
  cantidad: number
  fecha: string
  valor: number
  factura_path: string | null
  created_at: string
  updated_at: string
}

export type Gasto = ProductoGasto

export type FilaHistorialUsuario = {
  historial_id: string
  user_id: string
  total_gastado: number
  nombre?: string
}

export type HistorialMensual = {
  id: string
  anio: number
  mes: number
  total_gastado: number
  num_compras: number
  num_productos: number
  estado: 'pendiente' | 'saldado'
  saldado_at: string | null
  cerrado: boolean
}

export type FilaHistorial = {
  id: string
  anio: number
  mes: number
  total_gastado: number
  num_compras: number
  num_productos: number
  estado: 'pendiente' | 'saldado'
  saldado_at: string | null
  cerrado: boolean
  por_usuario: {
    user_id: string
    nombre: string
    total_gastado: number
  }[]
}

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

