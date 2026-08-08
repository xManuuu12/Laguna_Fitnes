import { Payment } from './payment.interface';

export interface Member {
  id_miembro?: number;
  id_gimnasio?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  estado: 'activo' | 'vencido';
  fecha_registro?: string;
  fecha_vencimiento?: string; // Nueva propiedad para la tabla
  fecha_pago?: string;
  Payments?: Payment[];
}
