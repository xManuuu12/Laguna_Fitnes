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
