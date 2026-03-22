export interface Payment {
  id_pago?: number;
  id_miembro: number;
  id_membresia: number;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta';
  fecha_vencimiento: string;
  fecha_pago?: string;
}
