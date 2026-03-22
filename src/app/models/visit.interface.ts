export interface Visit {
  id_visita?: number;
  id_miembro: number;
  nombre?: string;
  apellido?: string;
  fecha_visita: string;
  hora_entrada: string;
  hora_salida?: string;
  estado_membresia?: 'activo' | 'vencido';
  comentarios?: string;
}
