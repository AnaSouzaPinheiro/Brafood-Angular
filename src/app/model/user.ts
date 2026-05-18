export interface User {
  id: any;
  email: string;
  nome?: string;
  sobrenome?: string;
  apelido?: string;
  genero?: string;
  bio?: string;
  foto_perfil?: string;
  is_admin?: number; // 0 ou 1
}

export interface UserResponse {
  success: boolean;
  usuario: User;
}