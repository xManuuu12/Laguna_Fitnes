export interface Payment {
  id_pago?: number;
  id_miembro: number;
  monto: number;
  tipo_membresia: string;
  fecha_pago?: string;
  fecha_vencimiento: string;
}
