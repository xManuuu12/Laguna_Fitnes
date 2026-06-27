export interface User {
  id_usuario: number;
  id_gimnasio: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'recepcion';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}

// Payload para crear/actualizar usuarios. En update todos los campos son
// opcionales; el password solo se envía cuando se quiere cambiar.
export interface UserPayload {
  nombre?: string;
  email?: string;
  rol?: User['rol'];
  password?: string;
}
