'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { formatearPesos, formatearFecha } from '@/lib/format'
import { fechaHoyBogota } from '@/lib/fecha'
import {
  obtenerCompraAbierta,
  actualizarCompra,
  eliminarCompra,
  listarProductosCompra,
  listarComprasMesActual,
} from '@/lib/datos'
import type { Compra, ProductoGasto } from '@/lib/types'
import NuevaCompra from '@/components/registros/NuevaCompra'
import FormularioProducto from '@/components/registros/FormularioProducto'
import ListaProductos from '@/components/registros/ListaProductos'
import ComprasDelMes from '@/components/registros/ComprasDelMes'

export default function Registros() {
  const { user, perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [compraAbierta, setCompraAbierta] = useState<Compra | null>(null)
  const [compraResumen, setCompraResumen] = useState<Compra | null>(null)
  const [productos, setProductos] = useState<ProductoGasto[]>([])
  const [productoEditando, setProductoEditando] = useState<ProductoGasto | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [modo, setModo] = useState<'uno' | 'varios' | null>(null)
  const [comprasMes, setComprasMes] = useState<Compra[]>([])
  const [limpiarTrigger, setLimpiarTrigger] = useState(0)
  const [contadorCompraHoy, setContadorCompraHoy] = useState(0)
  const [resumenSaldado, setResumenSaldado] = useState(false)

  async function cargarTodo() {
    try {
      setError(null)
      setCargando(true)
      const abierta = user ? await obtenerCompraAbierta(user.id) : null
      setCompraAbierta(abierta)
      if (abierta) {
        const prods = await listarProductosCompra(abierta.id)
        setProductos(prods)
        setCompraResumen(null)
        setResumenSaldado(false)
      } else {
        setProductos([])
        setProductoEditando(null)
      }
      const mes = await listarComprasMesActual()
      setComprasMes(mes)
      if (user) {
        const hoy = fechaHoyBogota()
        setContadorCompraHoy(mes.filter((c) => c.user_id === user.id && c.fecha === hoy).length)
      }
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (user) {
      cargarTodo()
    }
  }, [user])

  async function onCompraCreada(m: 'uno' | 'varios') {
    setModo(m)
    setCompraResumen(null)
    setExito(null)
    setResumenSaldado(false)
    await cargarTodo()
  }

  async function recargarProductos() {
    if (!compraAbierta) return
    const prods = await listarProductosCompra(compraAbierta.id)
    setProductos(prods)
    setLimpiarTrigger((t) => t + 1)
  }

  function cancelarEdicion() {
    setProductoEditando(null)
  }

  async function cerrarCompra(compra: Compra) {
    try {
      setError(null)
      await actualizarCompra(compra.id, { cerrada: true, estado: 'pendiente' })
      const prods = await listarProductosCompra(compra.id)
      setProductos(prods)
      setCompraResumen({ ...compra, cerrada: true, estado: 'pendiente' })
      setCompraAbierta(null)
      setProductoEditando(null)
      setResumenSaldado(false)
      const mes = await listarComprasMesActual()
      setComprasMes(mes)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo cerrar la compra')
    }
  }

  async function cancelarCompra() {
    if (!compraAbierta) return
    const ok = window.confirm('¿Cancelar compra? Se eliminarán sus productos.')
    if (!ok) return
    try {
      setError(null)
      await eliminarCompra(compraAbierta.id)
      setCompraResumen(null)
      setResumenSaldado(false)
      await cargarTodo()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo cancelar la compra')
    }
  }

  async function editarCompra() {
    if (!compraResumen) return
    try {
      setError(null)
      await actualizarCompra(compraResumen.id, { cerrada: false })
      setCompraResumen(null)
      setExito(null)
      setResumenSaldado(false)
      await cargarTodo()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo editar la compra')
    }
  }

  function nuevaCompra() {
    setCompraResumen(null)
    setExito(null)
    setError(null)
    setProductoEditando(null)
    setProductos([])
    setModo(null)
    setResumenSaldado(false)
    setLimpiarTrigger((t) => t + 1)
    cargarTodo()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const totalCompra = productos.reduce((s, p) => s + p.valor, 0)
  const esMioAbierta = !!compraAbierta && !!user && compraAbierta.user_id === user.id
  const pendienteAbierta = esMioAbierta && compraAbierta.estado === 'pendiente'
  const esMioResumen = !!compraResumen && !!user && compraResumen.user_id === user.id
  const pendienteResumen = esMioResumen && compraResumen.estado === 'pendiente'

  const mostrarBotonNuevaSuperior = !compraAbierta && !compraResumen

  if (cargando) return <p>Cargando...</p>

  return (
    <section className='pagina'>
      <header className='pagina__encabezado'>
        <h1 className='pagina__titulo'>Registros</h1>
      </header>

      {error && <p className='alerta alerta--error'>{error}</p>}
      {exito && <p className='alerta alerta--exito'>{exito}</p>}

      <NuevaCompra
        compraAbierta={compraAbierta}
        onCreada={onCompraCreada}
        contadorCompraHoy={contadorCompraHoy}
        mostrarBoton={mostrarBotonNuevaSuperior}
      />

      {compraAbierta && (
        <>
          <div className='tarjeta'>
            <h2 className='lista__titulo'>Compra en curso</h2>
            <p>
              {formatearFecha(compraAbierta.fecha)} • {compraAbierta.descripcion || 'Sin descripción'}
            </p>
            {pendienteAbierta && (
              <div className='formulario__acciones'>
                <button className='boton boton--peligro' type='button' onClick={cancelarCompra}>
                  Cancelar compra
                </button>
              </div>
            )}
          </div>

          <FormularioProducto
            compra={compraAbierta}
            productoEditando={productoEditando}
            onGuardado={recargarProductos}
            onCancelarEdicion={cancelarEdicion}
            guardando={guardando}
            setGuardando={setGuardando}
            setError={setError}
            setExito={setExito}
            limpiarTrigger={limpiarTrigger}
            onGuardarNuevo={() => {
              if (modo === 'uno') {
                cerrarCompra(compraAbierta)
              } else {
                recargarProductos()
              }
            }}
            modo={modo}
          />

          <ListaProductos
            compra={compraAbierta}
            productos={productos}
            puedeEditar={pendienteAbierta}
            onEditar={(p: ProductoGasto) => {
              setProductoEditando(p)
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onActualizado={recargarProductos}
            setError={setError}
            setExito={setExito}
          />

          {productos.length > 0 && (
            <div className='tarjeta'>
              <button
                className='boton boton--primario'
                type='button'
                onClick={() => cerrarCompra(compraAbierta)}
                disabled={!pendienteAbierta}
              >
                Terminar compra
              </button>
            </div>
          )}
        </>
      )}

      {compraResumen && (
        <div className='tarjeta'>
          <h2 className='lista__titulo'>Resumen de la compra</h2>
          <p>
            {formatearFecha(compraResumen.fecha)} • {compraResumen.descripcion || 'Sin descripción'}
          </p>
          <p>
            Total de la compra: {formatearPesos(totalCompra)}, {productos.length}{' '}
            {productos.length === 1 ? 'producto' : 'productos'}
          </p>
          <p>Estado: pendiente de saldar. El saldo aparecerá en Cuentas hasta que se salde.</p>
          <div className='formulario__acciones'>
            {pendienteResumen && (
              <button className='boton boton--secundario' type='button' onClick={editarCompra}>
                Editar compra
              </button>
            )}
            <button className='boton boton--secundario' type='button' onClick={nuevaCompra}>
              Nueva compra
            </button>
          </div>
        </div>
      )}

      <ComprasDelMes
        compras={comprasMes}
        user={user}
        perfil={perfil}
        compraAbierta={compraAbierta}
        onReabrir={cargarTodo}
        onEliminar={cargarTodo}
        setError={setError}
      />
    </section>
  )
}