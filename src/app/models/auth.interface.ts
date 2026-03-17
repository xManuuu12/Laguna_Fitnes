export interface User {
  id_usuario: number;
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
