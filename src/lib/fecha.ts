export function fechaHoyBogota(): string {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset()
  const bogota = new Date(ahora.getTime() + (offset + 300) * 60 * 1000)
  const anio = bogota.getFullYear()
  const mes = String(bogota.getMonth() + 1).padStart(2, '0')
  const dia = String(bogota.getDate()).padStart(2, '0')
  return anio + '-' + mes + '-' + dia
}
