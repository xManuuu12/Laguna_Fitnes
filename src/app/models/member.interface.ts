export interface Member {
  id_miembro?: number;
  id_gimnasio?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  estado: 'activo' | 'vencido';
  fecha_registro?: string;
  fecha_vencimiento?: string; // Nueva propiedad para la tabla
}
