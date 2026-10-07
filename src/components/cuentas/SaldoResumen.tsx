'use client'

import { formatearPesos } from '@/lib/format'

type Props = {
  saldo: number
  nombreA: string
  nombreB: string
  usuarioNombre: string
}

export default function SaldoResumen({ saldo, nombreA, nombreB, usuarioNombre }: Props) {
  if (Math.abs(saldo) < 1) {
    return (
      <div className='tarjeta'>
        <h2>Saldo</h2>
        <p>Están a mano</p>
      </div>
    )
  }
  if (saldo > 0) {
    return (
      <div className='tarjeta'>
        <h2>Saldo</h2>
        <p>{nombreB} te debe {formatearPesos(saldo)}</p>
      </div>
    )
  }
  const debe = Math.abs(saldo)
  return (
    <div className='tarjeta'>
      <h2>Saldo</h2>
      <p>Le debes {formatearPesos(debe)} a {nombreB}</p>
    </div>
  )
}
