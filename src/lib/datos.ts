import { supabase } from './supabase'

import type { Compra, ProductoGasto, Perfil, HistorialMensual, FilaHistorial } from './types'

const supabaseBrowser = supabase

export type DatosProducto = {
  nombre_gasto: string
  cantidad: number
  valor: number
}

export async function obtenerCompraAbierta(userId: string): Promise<Compra | null> {
  const { data, error } = await supabaseBrowser
    .from('compras')
    .select('*')
    .eq('user_id', userId)
    .eq('cerrada', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Compra | null
}
export async function crearCompra(
  userId: string,
  datos: { descripcion: string | null; fecha: string },
): Promise<Compra> {
  const { data, error } = await supabaseBrowser
    .from('compras')
    .insert({
      user_id: userId,
      descripcion: datos.descripcion,
      fecha: datos.fecha,
      estado: 'pendiente',
      cerrada: false,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Compra
}

export async function actualizarCompra(
  id: string,
  datos: Partial<Pick<Compra, 'descripcion' | 'fecha' | 'cerrada' | 'estado'>>,
): Promise<void> {
  const { error } = await supabaseBrowser.from('compras').update(datos).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarCompra(id: string): Promise<void> {
  const { error } = await supabaseBrowser.from('compras').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function listarProductosCompra(compraId: string): Promise<ProductoGasto[]> {
  const { data, error } = await supabaseBrowser
    .from('gastos')
    .select('*')
    .eq('compra_id', compraId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProductoGasto[]
}

export async function crearProducto(
  compraId: string,
  userId: string,
  datos: DatosProducto,
): Promise<ProductoGasto> {
  const { data, error } = await supabaseBrowser
    .from('gastos')
    .insert({
      compra_id: compraId,
      user_id: userId,
      nombre_gasto: datos.nombre_gasto,
      cantidad: datos.cantidad,
      valor: datos.valor,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as ProductoGasto
}

export async function actualizarProducto(id: string, datos: DatosProducto): Promise<void> {
  const { error } = await supabaseBrowser.from('gastos').update(datos).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabaseBrowser.from('gastos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function listarComprasMesActual(): Promise<Compra[]> {
  const hoy = new Date()
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  const { data, error } = await supabaseBrowser
    .from('compras')
    .select('*')
    .gte('fecha', inicio.toISOString().split('T')[0])
    .lt('fecha', fin.toISOString().split('T')[0])
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Compra[]
}

export async function listarComprasPorMes(): Promise<Compra[]> {
  const { data, error } = await supabaseBrowser
    .from('compras')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Compra[]
}

export async function listarHistorial(): Promise<FilaHistorial[]> {
  const { data: meses, error: errorMeses } = await supabaseBrowser
    .from('historial_mensual')
    .select('*')
    .order('anio', { ascending: false })
    .order('mes', { ascending: false })
  if (errorMeses) throw new Error(errorMeses.message)
  const mesesList = (meses ?? []) as HistorialMensual[]
  if (mesesList.length === 0) return []
  const ids = mesesList.map((m) => m.id)
  const { data: usu, error: errorUsu } = await supabaseBrowser
    .from('historial_mensual_usuario')
    .select('*')
    .in('historial_id', ids)
  if (errorUsu) throw new Error(errorUsu.message)
  const usuariosList = (usu ?? []) as any[]
  const userIds = Array.from(new Set(usuariosList.map((u) => u.user_id)))
  let perfilesMap = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: perfiles } = await supabaseBrowser
      .from('profiles')
      .select('id, nombre')
      .in('id', userIds)
    perfilesMap = new Map(((perfiles ?? []) as Perfil[]).map((p) => [p.id, p.nombre]))
  }
  const porHistorial = new Map<string, any[]>()
  for (const u of usuariosList) {
    const arr = porHistorial.get(u.historial_id) ?? []
    arr.push(u)
    porHistorial.set(u.historial_id, arr)
  }
  const filas: FilaHistorial[] = mesesList.map((m) => {
    const listUsu = (porHistorial.get(m.id) ?? []).map((u) => ({
      user_id: u.user_id,
      nombre: perfilesMap.get(u.user_id) ?? '',
      total_gastado: Number(u.total_gastado),
    }))
    return {
      id: m.id,
      anio: m.anio,
      mes: m.mes,
      total_gastado: Number(m.total_gastado),
      num_compras: (m as any).num_compras ?? 0,
      num_productos: (m as any).num_productos ?? 0,
      estado: m.estado,
      saldado_at: m.saldado_at,
      cerrado: m.cerrado,
      por_usuario: listUsu,
    }
  })
  return filas
}

export async function listarComprasCerradasPendientes(): Promise<(Compra & { num_productos?: number })[]> {
  const { data, error } = await supabaseBrowser
    .from('compras')
    .select('*, gastos(count)')
    .eq('cerrada', true)
    .eq('estado', 'pendiente')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as (Compra & { gastos?: { count: number }[] })[]).map((c) => ({
    ...c,
    num_productos: c.gastos?.[0]?.count ?? 0,
  }))
}

export async function listarComprasCerradas(): Promise<Compra[]> {
  const { data, error } = await supabaseBrowser
    .from('compras')
    .select('*')
    .eq('cerrada', true)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Compra[]
}
