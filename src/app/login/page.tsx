'use client'

import { useState, type FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user, cargando, iniciarSesion } = useAuth()
  const router = useRouter()

  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!cargando && user) {
      router.replace('/')
    }
  }, [cargando, user, router])

  if (cargando || user) {
    return null
  }

  function construirCorreo(valor: string): string {
    const limpio = valor.trim().toLowerCase().replace(/\s+/g, '')
    if (limpio.includes('@')) {
      return limpio
    }
    return limpio + '@chris.app'
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(null)

    if (!usuario.trim() || !contrasena) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    setEnviando(true)
    const correo = construirCorreo(usuario)
    const mensajeError = await iniciarSesion(correo, contrasena)
    setEnviando(false)

    if (mensajeError) {
      setError('Usuario o contraseña incorrectos')
      return
    }
    router.replace('/')
  }

  return (
    <div className='login'>
      <form className='tarjeta login__tarjeta' onSubmit={manejarEnvio} noValidate>
        <Image
          className='login__foto'
          src='/LogoPrincipal.jpg'
          alt='App Chris'
          width={96}
          height={96}
        />
        <h1 className='login__titulo'>App Chris</h1>
        <p className='login__subtitulo'>Ingresa para registrar y ver los gastos.</p>

        <label className='campo'>
          <span className='campo__etiqueta'>Usuario</span>
          <input
            className='campo__control'
            type='text'
            name='usuario'
            autoComplete='username'
            inputMode='text'
            placeholder='djs o tgd'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </label>

        <label className='campo'>
          <span className='campo__etiqueta'>Contraseña</span>
          <input
            className='campo__control'
            type='password'
            name='contrasena'
            autoComplete='current-password'
            placeholder='Contraseña'
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className='alerta alerta--error' role='alert'>
            {error}
          </p>
        )}

        <button
          className='boton boton--primario boton--ancho'
          type='submit'
          disabled={enviando}
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className='login__nota'>
          Acceso exclusivo para Tatiana Guerrero y David Jimenez.
        </p>
      </form>
    </div>
  )
}



