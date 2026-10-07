'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function CambiarClave() {
  const { cargando, user, perfil, actualizarPerfil, cerrarSesion } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const debeCambiar = perfil?.debe_cambiar_clave !== false

  useEffect(() => {
    if (cargando) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (perfil && perfil.debe_cambiar_clave === false) {
      router.replace('/')
    }
  }, [cargando, user, perfil, router])

  if (cargando || !user || !debeCambiar) return null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setGuardando(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await actualizarPerfil({ debe_cambiar_clave: false })
      setPassword('')
      setPassword2('')
      router.replace('/')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Layout pestanas={false}>
      <div className='login'>
        <form className='login__formulario' onSubmit={handleSubmit} noValidate>
          <h1 className='login__titulo'>App Chris</h1>
          <p>Por seguridad, elige tu propia contraseña</p>
          <div className='campo'>
            <label className='campo__etiqueta' htmlFor='pass'>
              Nueva contraseña
            </label>
            <input
              id='pass'
              className='campo__control'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='new-password'
            />
          </div>
          <div className='campo'>
            <label className='campo__etiqueta' htmlFor='pass2'>
              Repetir contraseña
            </label>
            <input
              id='pass2'
              className='campo__control'
              type='password'
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete='new-password'
            />
          </div>
          <button className='boton boton--primario' type='submit' disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            className='boton boton--secundario'
            type='button'
            onClick={cerrarSesion}
            disabled={guardando}
          >
            Cerrar sesión
          </button>
          {error && <p className='alerta alerta--error'>{error}</p>}
        </form>
      </div>
    </Layout>
  )
}
