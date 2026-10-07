'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { formatearPesos } from '@/lib/format'
import { crearProducto, actualizarProducto, type DatosProducto } from '@/lib/datos'
import type { ProductoGasto, Compra } from '@/lib/types'

const MAX_NOMBRE = 64

type Props = {
  compra: Compra
  productoEditando?: ProductoGasto | null
  onGuardado: () => void
  onCancelarEdicion: () => void
  guardando: boolean
  setGuardando: (v: boolean) => void
  setError: (v: string | null) => void
  setExito: (v: string | null) => void
  limpiarTrigger: number
  onGuardarNuevo: () => void
  modo: 'uno' | 'varios' | null
}

export default function FormularioProducto({
  compra,
  productoEditando,
  onGuardado,
  onCancelarEdicion,
  guardando,
  setGuardando,
  setError,
  setExito,
  limpiarTrigger,
  onGuardarNuevo,
  modo,
}: Props) {
  const [formulario, setFormulario] = useState({
    nombre_gasto: '',
    cantidad: '1',
    valor: '',
  })

  useEffect(() => {
    if (productoEditando) {
      setFormulario({
        nombre_gasto: productoEditando.nombre_gasto,
        cantidad: String(productoEditando.cantidad),
        valor: String(Math.round(productoEditando.valor)),
      })
    } else {
      setFormulario({ nombre_gasto: '', cantidad: '1', valor: '' })
    }
  }, [productoEditando])

  useEffect(() => {
    if (!productoEditando) {
      setFormulario({ nombre_gasto: '', cantidad: '1', valor: '' })
    }
  }, [limpiarTrigger])

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setExito(null)
    const valor = Number(formulario.valor)
    const desc = formulario.nombre_gasto.trim()
    if (desc.length < 1) {
      setError('Escribe el nombre del gasto.')
      return
    }
    if (desc.length > MAX_NOMBRE) {
      setError('El nombre del gasto puede tener máximo ' + MAX_NOMBRE + ' caracteres.')
      return
    }
    const cantidad = Number(formulario.cantidad)
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError('La cantidad debe ser un entero mayor que 0.')
      return
    }
    if (!Number.isFinite(valor) || valor < 0 || !Number.isInteger(valor)) {
      setError('El valor debe ser un entero en COP mayor o igual a 0.')
      return
    }
    setGuardando(true)
    try {
      const datos: DatosProducto = {
        nombre_gasto: desc,
        cantidad,
        valor,
      }
      if (productoEditando) {
        await actualizarProducto(productoEditando.id, datos)
        setExito('Producto actualizado.')
        onCancelarEdicion()
        onGuardado()
      } else {
        await crearProducto(compra.id, compra.user_id, datos)
        if (modo === 'uno') {
          setExito('Compra cerrada con 1 producto.')
          await onGuardarNuevo()
        } else {
          setExito('Producto guardado.')
          await onGuardado()
        }
      }
      if (!productoEditando) {
        setFormulario({ nombre_gasto: '', cantidad: '1', valor: '' })
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className='tarjeta formulario' onSubmit={manejarEnvio} noValidate>
      {productoEditando && (
        <p className='alerta alerta--edicion'>Estás editando un producto. Al guardar se actualiza, no se duplica.</p>
      )}
      <div className='formulario__rejilla'>
        <div className='campo campo--ancho'>
          <label className='campo__etiqueta' htmlFor='nombre_gasto'>
            Nombre del gasto
          </label>
          <input
            id='nombre_gasto'
            className='campo__control'
            type='text'
            maxLength={MAX_NOMBRE}
            value={formulario.nombre_gasto}
            onChange={(e) => setFormulario({ ...formulario, nombre_gasto: e.target.value })}
            placeholder='Ej: Leche'
          />
          <span className='campo__ayuda'>
            {formulario.nombre_gasto.length}/{MAX_NOMBRE} caracteres
          </span>
        </div>
        <div className='campo'>
          <label className='campo__etiqueta' htmlFor='cantidad'>
            Cantidad
          </label>
          <input
            id='cantidad'
            className='campo__control'
            type='number'
            min='1'
            step='1'
            inputMode='numeric'
            value={formulario.cantidad}
            onChange={(e) => setFormulario({ ...formulario, cantidad: e.target.value })}
          />
        </div>
        <div className='campo'>
          <label className='campo__etiqueta' htmlFor='valor'>
            Valor total (COP)
          </label>
          <input
            id='valor'
            className='campo__control'
            type='number'
            min='0'
            step='1'
            inputMode='numeric'
            value={formulario.valor}
            onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
            placeholder='0'
          />
          {formulario.valor && (
            <span className='campo__ayuda'>{formatearPesos(Number(formulario.valor) || 0)}</span>
          )}
        </div>
      </div>
      <div className='formulario__acciones'>
        <button className='boton boton--primario' type='submit' disabled={guardando}>
          {productoEditando ? 'Actualizar producto' : 'Guardar producto'}
        </button>
        {productoEditando && (
          <button className='boton boton--secundario' type='button' onClick={onCancelarEdicion} disabled={guardando}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  )
}