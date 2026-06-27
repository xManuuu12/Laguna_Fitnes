/**
 * Devuelve una fecha en formato YYYY-MM-DD usando la zona horaria LOCAL.
 *
 * Usar SIEMPRE esto en lugar de `new Date().toISOString().split('T')[0]`:
 * `toISOString()` devuelve UTC, así que en offsets negativos (p. ej. -06:00)
 * por la tarde/noche adelanta el día (22:31 del 26 -> "2026-06-27"), lo que
 * provoca que las visitas se registren un día adelante.
 *
 * @param date Fecha a formatear (por defecto, ahora).
 */
export function toLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
