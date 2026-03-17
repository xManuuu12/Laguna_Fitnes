export interface Member {
  id_miembro?: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fecha_registro?: string;
  estado?: 'activo' | 'vencido';
}
