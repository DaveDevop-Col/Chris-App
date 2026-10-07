'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fechaHoyBogota } from '@/lib/fecha'
import { crearCompra } from '@/lib/datos'
import type { Compra } from '@/lib/types'

const MAX_DESC = 64

type Props = {
  compraAbierta: Compra | null
  onCreada: (modo: 'uno' | 'varios') => void
  contadorCompraHoy?: number
  mostrarBoton?: boolean
}

export default function NuevaCompra({ compraAbierta, onCreada, contadorCompraHoy = 0, mostrarBoton = true }: Props) {
  const { user } = useAuth()
  const [mostrando, setMostrando] = useState(false)
  const [pregunta, setPregunta] = useState(false)
  const [modo, setModo] = useState<'uno' | 'varios' | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(fechaHoyBogota())
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (compraAbierta) {
      setMostrando(false)
      setPregunta(false)
      setModo(null)
    }
  }, [compraAbierta])

  useEffect(() => {
    setDescripcion('Compra ' + (contadorCompraHoy + 1))
  }, [contadorCompraHoy, mostrando])

  if (compraAbierta) return null
  if (!mostrarBoton) return null

  if (!mostrando) {
    return (
      <div className='tarjeta'>
        <button className='boton boton--primario' type='button' onClick={() => setMostrando(true)}>
          Nueva compra
        </button>
      </div>
    )
  }

  if (mostrando && !pregunta) {
    return (
      <div className='tarjeta'>
        <p>¿Vas a registrar más de un producto?</p>
        <div className='formulario__acciones'>
          <button
            className='boton boton--primario'
            type='button'
            onClick={() => {
              setModo('varios')
              setPregunta(true)
            }}
          >
            Sí, varios productos
          </button>
          <button
            className='boton boton--secundario'
            type='button'
            onClick={() => {
              setModo('uno')
              setPregunta(true)
            }}
          >
            No, solo uno
          </button>
        </div>
        <div className='formulario__acciones'>
          <button className='boton boton--secundario' type='button' onClick={() => setMostrando(false)}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || !modo) return
    setError(null)
    setGuardando(true)
    try {
      const desc = descripcion.trim()
      const descFinal = desc.length === 0 ? 'Compra ' + (contadorCompraHoy + 1) : desc
      await crearCompra(user.id, { descripcion: descFinal, fecha })
      onCreada(modo)
      setMostrando(false)
      setPregunta(false)
      setModo(null)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo crear la compra')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className='tarjeta formulario' onSubmit={handleSubmit} noValidate>
      <h2 className='lista__titulo'>Nueva compra</h2>
      <div className='campo campo--ancho'>
        <label className='campo__etiqueta' htmlFor='desc'>
          Nombre de la compra
        </label>
        <input
          id='desc'
          className='campo__control'
          type='text'
          maxLength={MAX_DESC}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder={'Compra ' + (contadorCompraHoy + 1)}
        />
        <span className='campo__ayuda'>
          {descripcion.length}/{MAX_DESC} caracteres
        </span>
      </div>
      <div className='campo'>
        <label className='campo__etiqueta' htmlFor='fecha'>
          Fecha
        </label>
        <input
          id='fecha'
          className='campo__control'
          type='date'
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>
      <div className='formulario__acciones'>
        <button className='boton boton--primario' type='submit' disabled={guardando}>
          Crear compra
        </button>
        <button
          className='boton boton--secundario'
          type='button'
          onClick={() => {
            setMostrando(false)
            setPregunta(false)
            setModo(null)
          }}
          disabled={guardando}
        >
          Cancelar
        </button>
      </div>
      {error && <p className='alerta alerta--error'>{error}</p>}
    </form>
  )
}